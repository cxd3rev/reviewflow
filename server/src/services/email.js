import { Resend } from "resend";
import { buildReviewEmail } from "../utils/templates.js";

export async function sendReviewEmail({ business, customer, reviewUrl }) {
  const email = buildReviewEmail({ business, customer, reviewUrl });
  const from = process.env.EMAIL_FROM;
  const apiKey = process.env.EMAIL_API_KEY;
  const logOnly = String(process.env.EMAIL_LOG_ONLY || "").toLowerCase() === "true";

  if (logOnly || !apiKey) {
    console.log("[email:dev]", {
      to: customer.email,
      from,
      subject: email.subject,
      reviewUrl,
      text: email.text,
    });
    if (process.env.NODE_ENV === "production" && !logOnly) {
      throw new Error("Email is not configured.");
    }
    return { id: "logged" };
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: customer.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to send email.");
  }

  return result.data;
}
