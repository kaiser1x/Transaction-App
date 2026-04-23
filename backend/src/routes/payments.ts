import { Router } from "express";
import { randomUUID } from "crypto";
import { queryOne, execute } from "../db.js";
import { createPaymentIntent, verifyPaymentIntent } from "../services/stripe.js";
import type { PaymentPage } from "../types.js";

const router = Router();

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

    const status = await verifyPaymentIntent(stripeIntentId);
    const txId = randomUUID();

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

    res.status(201).json({ transactionId: txId, status });
  } catch (err) {
    next(err);
  }
});

export default router;
