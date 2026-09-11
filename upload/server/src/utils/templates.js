export function applyTemplate(template, vars) {
  return String(template || "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return vars[key] == null ? "" : String(vars[key]);
  });
}

export function buildReviewEmail({ business, customer, reviewUrl }) {
  const customerName = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();
  const businessName = business.sender_name || business.name;
  const vars = {
    customer_name: customerName || "there",
    business_name: businessName,
  };

  const subject = applyTemplate(business.email_subject, vars);
  const message = applyTemplate(business.email_message, vars);
  const htmlMessage = escapeAndBreak(message);

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f1ec;font-family:Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ec;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e7e0d6;border-radius:12px;padding:36px;">
            <tr>
              <td style="color:#1c1917;font-size:22px;font-weight:700;padding-bottom:16px;">
                ${escapeHtml(businessName)}
              </td>
            </tr>
            <tr>
              <td style="color:#44403c;font-size:16px;line-height:1.6;white-space:pre-wrap;">
                ${htmlMessage}
              </td>
            </tr>
            <tr>
              <td style="padding:28px 0 8px;">
                <a href="${escapeHtml(reviewUrl)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;">
                  Leave a Review
                </a>
              </td>
            </tr>
            <tr>
              <td style="color:#78716c;font-size:13px;padding-top:20px;font-family:Arial,sans-serif;">
                This message was sent by starywrld on behalf of ${escapeHtml(businessName)}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text: `${message}\n\nLeave a Review: ${reviewUrl}\n`, html };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAndBreak(value) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}
