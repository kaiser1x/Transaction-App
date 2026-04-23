import { Router } from "express";
import { execute } from "../db.js";
import { constructWebhookEvent } from "../services/stripe.js";

const router = Router();

// POST /api/webhooks/stripe
// express.raw() must be applied before express.json() in index.ts
router.post("/stripe", (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    const event = constructWebhookEvent(req.body as Buffer, sig);

    if (
      event.type === "payment_intent.succeeded" ||
      event.type === "payment_intent.payment_failed"
    ) {
      const intent = event.data.object as { id: string };
      const status =
        event.type === "payment_intent.succeeded" ? "success" : "failed";

      execute(
        "UPDATE transactions SET status = ? WHERE stripe_intent_id = ?",
        [status, intent.id]
      ).catch(console.error);
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

export default router;
