import { Router } from "express";
import { randomUUID } from "crypto";
import { query, queryOne, execute } from "../db.js";
import { checkJwt } from "../middleware/auth.js";
import { sendPaymentReceiptEmail } from "../services/email.js";
import { createPaymentIntent, verifyPaymentIntent } from "../services/stripe.js";
import type { PaymentPage, Transaction, User } from "../types.js";

const router = Router();

interface PaymentHistoryRow extends Transaction {
  page_title: string;
}

// GET /api/payments/mine — return transactions for the signed-in payer email
router.get("/mine", checkJwt, async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload["sub"] as string | undefined;

    if (!auth0Id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await queryOne<User>(
      "SELECT email FROM users WHERE auth0_id = ?",
      [auth0Id]
    );
    const payerEmail = user?.email?.trim();

    if (!payerEmail) {
      res.status(400).json({ error: "Signed-in user email is required" });
      return;
    }

    const rows = await query<PaymentHistoryRow>(
      `SELECT t.*, p.title AS page_title
       FROM transactions t
       JOIN payment_pages p ON t.page_id = p.id
       WHERE LOWER(t.payer_email) = LOWER(?)
       ORDER BY t.created_at DESC`,
      [payerEmail]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/intent — create Stripe PaymentIntent
router.post("/intent", async (req, res, next) => {
  try {
    const { pageId, amount, payerEmail, payerName } = req.body as {
      pageId: string;
      amount: number;
      payerEmail?: string;
      payerName?: string;
    };

    if (!pageId || !amount) {
      res.status(400).json({ error: "pageId and amount are required" });
      return;
    }

    const page = await queryOne<PaymentPage>(
      "SELECT * FROM payment_pages WHERE id = ? AND is_active = TRUE",
      [pageId]
    );
    if (!page) {
      res.status(404).json({ error: "Payment page not found" });
      return;
    }

    // Validate amount against page config
    const amt = Number(amount);
    if (page.amount_mode === "fixed" && amt !== Number(page.fixed_amount)) {
      res.status(400).json({ error: "Amount does not match fixed price" });
      return;
    }
    if (page.amount_mode === "min_max") {
      if (amt < Number(page.min_amount) || amt > Number(page.max_amount)) {
        res.status(400).json({ error: "Amount is outside allowed range" });
        return;
      }
    }

    const { clientSecret, intentId } = await createPaymentIntent(amt, {
      pageId,
      payerEmail: payerEmail ?? "",
      pageName: page.title,
    });

    res.json({ clientSecret, intentId });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/confirm — store transaction after Stripe confirmation
router.post("/confirm", async (req, res, next) => {
  try {
    const {
      stripeIntentId, pageId, amount, paymentMethod,
      payerName, payerEmail, glCode, fieldResponses,
    } = req.body as {
      stripeIntentId: string;
      pageId: string;
      amount: number;
      paymentMethod: "credit_card" | "ach" | "wallet";
      payerName?: string;
      payerEmail?: string;
      glCode?: string;
      fieldResponses?: { fieldId: string; value: string }[];
    };

    if (!stripeIntentId || !pageId || !amount) {
      res.status(400).json({ error: "stripeIntentId, pageId, and amount are required" });
      return;
    }

    const page = await queryOne<PaymentPage>(
      "SELECT * FROM payment_pages WHERE id = ?",
      [pageId]
    );
    if (!page) {
      res.status(404).json({ error: "Payment page not found" });
      return;
    }

    const status = await verifyPaymentIntent(stripeIntentId);
    const txId = randomUUID();
    const paymentDate = new Date();

    await execute(
      `INSERT INTO transactions
        (id, page_id, amount, payment_method, status, stripe_intent_id, payer_name, payer_email, gl_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        txId, pageId, amount,
        paymentMethod ?? "credit_card",
        status, stripeIntentId,
        payerName ?? null, payerEmail ?? null, glCode ?? null,
      ]
    );

    if (fieldResponses?.length) {
      for (const { fieldId, value } of fieldResponses) {
        await execute(
          "INSERT INTO field_responses (id, transaction_id, field_id, value) VALUES (?, ?, ?, ?)",
          [randomUUID(), txId, fieldId, value]
        );
      }
    }

    const normalizedEmail = payerEmail?.trim().toLowerCase() ?? null;
    let receiptEmailSent = false;

    if (status === "success" && normalizedEmail) {
      try {
        const receiptResult = await sendPaymentReceiptEmail({
          to: normalizedEmail,
          transactionId: txId,
          amount: Number(amount),
          paymentDate,
          pageTitle: page.title,
          pageSlug: page.slug,
          payerName: payerName ?? null,
          glCode: glCode ?? null,
        });
        receiptEmailSent = receiptResult.sent;
      } catch (emailErr) {
        console.error("Payment receipt email failed:", emailErr);
      }
    }

    res.status(201).json({
      transactionId: txId,
      status,
      receiptEmailSent,
      receiptEmail: normalizedEmail,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
