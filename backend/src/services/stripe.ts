import Stripe from "stripe";

const isMock = process.env["STRIPE_MOCK_SUCCESS"] === "true";
const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
let stripeClient: Stripe | null | undefined;

function getStripeClient(): Stripe | null {
  if (isMock) {
    return null;
  }

  if (stripeClient !== undefined) {
    return stripeClient;
  }

  if (!stripeSecretKey) {
    stripeClient = null;
    return stripeClient;
  }

  stripeClient = new Stripe(stripeSecretKey, {
    apiVersion: "2026-03-25.dahlia",
  });

  return stripeClient;
}

function requireStripeClient(): Stripe {
  const stripe = getStripeClient();

  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY or set STRIPE_MOCK_SUCCESS=true for local development."
    );
  }

  return stripe;
}

export async function createPaymentIntent(
  amountDollars: number,
  metadata: Record<string, string>
): Promise<{ clientSecret: string; intentId: string }> {
  const stripe = getStripeClient();

  if (isMock || !stripe) {
    const intentId = `mock_pi_${Date.now()}`;
    return { clientSecret: `${intentId}_secret_mock`, intentId };
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amountDollars * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
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
  const stripe = getStripeClient();

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
  const stripe = requireStripeClient();

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env["STRIPE_WEBHOOK_SECRET"] ?? ""
  );
}
