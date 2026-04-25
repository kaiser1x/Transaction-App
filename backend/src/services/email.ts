import { Resend } from "resend";

let resendClient: Resend | null | undefined;
let resendClientApiKey: string | undefined;

export interface EmailSendResult {
  sent: boolean;
  providerId?: string;
  reason?: string;
}

interface PaymentReceiptInput {
  to: string;
  transactionId: string;
  amount: number;
  paymentDate: Date;
  pageTitle: string;
  pageSlug: string;
  payerName?: string | null;
  glCode?: string | null;
}

function getResendClient(): Resend | null {
  const resendApiKey = process.env["RESEND_API_KEY"]?.trim();

  if (!resendApiKey) {
    resendClient = null;
    resendClientApiKey = undefined;
    return resendClient;
  }

  if (resendClient !== undefined && resendClientApiKey === resendApiKey) {
    return resendClient;
  }

  resendClient = new Resend(resendApiKey);
  resendClientApiKey = resendApiKey;
  return resendClient;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function buildPublicUrl(pageSlug: string): string {
  const frontendUrl = process.env["FRONTEND_URL"] ?? "http://localhost:5173";
  return new URL(`/pay/${encodeURIComponent(pageSlug)}`, frontendUrl).toString();
}

function buildReceiptHtml(input: PaymentReceiptInput): string {
  const payerGreeting = input.payerName?.trim()
    ? `Hi ${escapeHtml(input.payerName.trim())},`
    : "Hi,";
  const pageUrl = buildPublicUrl(input.pageSlug);
  const glCodeRow = input.glCode?.trim()
    ? `
      <tr>
        <td style="padding: 8px 0; color: #5c6b82;">GL code</td>
        <td style="padding: 8px 0; text-align: right; color: #0b1f3a; font-weight: 600;">${escapeHtml(input.glCode.trim())}</td>
      </tr>`
    : "";

  return `<!doctype html>
<html lang="en">
  <body style="margin: 0; background: #f7f1e4; font-family: Arial, sans-serif; color: #0b1f3a;">
    <div style="max-width: 640px; margin: 0 auto; padding: 32px 20px;">
      <div style="background: #ffffff; border: 1px solid #ead8b5; border-radius: 24px; padding: 32px;">
        <div style="display: inline-block; padding: 10px 16px; border-radius: 999px; background: #dff4ec; color: #1d8a63; font-weight: 700; font-size: 14px;">
          Payment receipt
        </div>
        <h1 style="margin: 20px 0 12px; font-size: 34px; line-height: 1.1;">Your payment was received.</h1>
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #3e5574;">
          ${payerGreeting} This email confirms that your payment for ${escapeHtml(input.pageTitle)} was submitted successfully.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #5c6b82;">Transaction ID</td>
            <td style="padding: 8px 0; text-align: right; color: #0b1f3a; font-weight: 600;">${escapeHtml(input.transactionId)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #5c6b82;">Amount paid</td>
            <td style="padding: 8px 0; text-align: right; color: #0b1f3a; font-weight: 600;">${escapeHtml(formatCurrency(input.amount))}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #5c6b82;">Payment page</td>
            <td style="padding: 8px 0; text-align: right; color: #0b1f3a; font-weight: 600;">${escapeHtml(input.pageTitle)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #5c6b82;">Date</td>
            <td style="padding: 8px 0; text-align: right; color: #0b1f3a; font-weight: 600;">${escapeHtml(formatDateTime(input.paymentDate))}</td>
          </tr>${glCodeRow}
        </table>
        <a
          href="${escapeHtml(pageUrl)}"
          style="display: inline-block; padding: 14px 20px; background: #ef7a3a; border-radius: 14px; color: #ffffff; font-weight: 700; text-decoration: none;"
        >
          Open payment page
        </a>
        <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #5c6b82;">
          Keep this receipt for your records. If you have billing questions, contact the provider listed on your statement.
        </p>
      </div>
    </div>
  </body>
</html>`;
}

function buildReceiptText(input: PaymentReceiptInput): string {
  const lines = [
    input.payerName?.trim() ? `Hi ${input.payerName.trim()},` : "Hi,",
    "",
    `Your payment for ${input.pageTitle} was submitted successfully.`,
    "",
    `Transaction ID: ${input.transactionId}`,
    `Amount paid: ${formatCurrency(input.amount)}`,
    `Payment page: ${input.pageTitle}`,
    `Date: ${formatDateTime(input.paymentDate)}`,
  ];

  if (input.glCode?.trim()) {
    lines.push(`GL code: ${input.glCode.trim()}`);
  }

  lines.push("", `Open payment page: ${buildPublicUrl(input.pageSlug)}`);

  return lines.join("\n");
}

export async function sendPaymentReceiptEmail(
  input: PaymentReceiptInput
): Promise<EmailSendResult> {
  const resend = getResendClient();
  const emailFrom = process.env["EMAIL_FROM"]?.trim();
  const emailReplyTo = process.env["EMAIL_REPLY_TO"]?.trim();

  if (!resend) {
    return { sent: false, reason: "resend_not_configured" };
  }

  if (!emailFrom) {
    return { sent: false, reason: "email_from_missing" };
  }

  if (!input.to.trim()) {
    return { sent: false, reason: "recipient_missing" };
  }

  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to: [input.to.trim()],
    subject: `Payment receipt for ${input.pageTitle}`,
    html: buildReceiptHtml(input),
    text: buildReceiptText(input),
    ...(emailReplyTo ? { replyTo: emailReplyTo } : {}),
  });

  if (error) {
    console.error("Failed to send payment receipt email:", error);
    return {
      sent: false,
      reason: "resend_send_failed",
    };
  }

  return {
    sent: true,
    providerId: data?.id,
  };
}
