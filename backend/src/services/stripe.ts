import Stripe from "stripe";

const isMock = process.env["STRIPE_MOCK_SUCCESS"] === "true";

const stripe = isMock
  ? null
  : new Stripe(process.env["STRIPE_SECRET_KEY"] ?? "", {
      apiVersion: "2026-03-25.dahlia",
    });

export async function createPaymentIntent(
  amountDollars: number,
  metadata: Record<string, string>
): Promise<{ clientSecret: string; intentId: string }> {
  if (isMock || !stripe) {
    const intentId = `mock_pi_${Date.now()}`;
    return { clientSecret: `${intentId}_secret_mock`, intentId };
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amountDollars * 100),
    currency: "usd",
    metadata,
  });

  return {
    clientSecret: intent.client_secret ?? "",
    intentId: intent.id,
  };
}

export async function verifyPaymentIntent(
  intentId: string
): Promise<"success" | "failed"> {
  if (isMock || intentId.startsWith("mock_pi_")) {
    return "success";
  }

  if (!stripe) return "failed";

  const intent = await stripe.paymentIntents.retrieve(intentId);
  return intent.status === "succeeded" ? "success" : "failed";
}

export function constructWebhookEvent(
  payload: Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) throw new Error("Stripe not initialized");
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env["STRIPE_WEBHOOK_SECRET"] ?? ""
  );
}
