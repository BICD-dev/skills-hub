import fs from "fs";
import path from "path";

const SUPPORT_CONTACTS = [
  "Ake - 09093832772",
  "Adebola - 08121985972",
];

function loadLogoBase64(): string {
  try {
    // Works both in dev (tsx, __dirname = src/templates/email)
    // and in prod (compiled, __dirname = dist/templates/email) — 3 levels up = backend root
    const logoPath = path.join(__dirname, "../../../assets/logo1.PNG");
    const data = fs.readFileSync(logoPath);
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return "";
  }
}

const LOGO_DATA_URI = loadLogoBase64();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface EmailFrameOptions {
  previewText: string;
  eyebrow: string;
  headline: string;
  intro: string[];
  highlight: string;
  buttonLabel: string;
  buttonUrl: string;
  supportContacts?: string[];
  closingLine: string;
}

export function buildEmailHtml({
  previewText,
  eyebrow,
  headline,
  intro,
  highlight,
  buttonLabel,
  buttonUrl,
  supportContacts = [],
  closingLine,
}: EmailFrameOptions): string {
  const safeButtonUrl = escapeHtml(buttonUrl);
  const introHtml = intro
    .map((paragraph) => `<p style="margin:0 0 16px;color:#111111;font-size:16px;line-height:1.7;">${escapeHtml(paragraph)}</p>`)
    .join("");
  const contactsHtml = supportContacts.length
    ? `
      <div style="margin-top:24px;padding:20px;border:2px solid #111111;background:#fff7cc;">
        <p style="margin:0 0 10px;color:#111111;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Questions &amp; Support</p>
        ${supportContacts
          .map(
            (contact) =>
              `<p style="margin:0 0 8px;color:#111111;font-size:15px;line-height:1.6;font-weight:700;">${escapeHtml(contact)}</p>`
          )
          .join("")}
      </div>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(headline)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f0e7;font-family:'DM Sans',Arial,sans-serif;color:#111111;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(previewText)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f0e7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:4px solid #111111;box-shadow:8px 8px 0 #111111;">
            <tr>
              <td style="background:#111111;padding:20px 28px;border-bottom:4px solid #facc15;">
                <p style="margin:0;color:#facc15;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;">TREM Latterhouse Sanctuary</p>
                ${LOGO_DATA_URI
                  ? `<img src="${LOGO_DATA_URI}" alt="Lead Conference" width="180" style="display:block;margin-top:10px;max-width:180px;height:auto;" />`
                  : `<p style="margin:10px 0 0;color:#ffffff;font-family:'Bebas Neue',Impact,'Arial Narrow Bold',sans-serif;font-size:40px;line-height:1;letter-spacing:0.04em;">LEAD CONFERENCE</p>`
                }
              </td>
            </tr>
            <tr>
              <td style="height:8px;background:linear-gradient(90deg,#facc15 0%,#dc2626 50%,#facc15 100%);"></td>
            </tr>
            <tr>
              <td style="padding:32px 28px 16px;background:#ffffff;">
                <p style="margin:0 0 12px;color:#b91c1c;font-size:12px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0 0 18px;color:#111111;font-family:'Bebas Neue',Impact,'Arial Narrow Bold',sans-serif;font-size:44px;line-height:1;letter-spacing:0.03em;text-transform:uppercase;">${escapeHtml(headline)}</h1>
                ${introHtml}
                <div style="margin:0 0 24px;padding:18px;border-left:6px solid #facc15;background:#fff7cc;">
                  <p style="margin:0;color:#111111;font-size:15px;line-height:1.7;font-weight:700;">${escapeHtml(highlight)}</p>
                </div>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px;">
                  <tr>
                    <td align="center" bgcolor="#111111" style="border:2px solid #111111;">
                      <a href="${safeButtonUrl}" style="display:inline-block;padding:14px 24px;color:#facc15;font-size:14px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">${escapeHtml(buttonLabel)}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;color:#4b5563;font-size:13px;line-height:1.6;">${escapeHtml(closingLine)}</p>
                ${contactsHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;background:#ffffff;">
                <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">If the button does not open, copy and paste this link into your browser:</p>
                <p style="margin:10px 0 0;font-size:12px;line-height:1.6;word-break:break-all;">
                  <a href="${safeButtonUrl}" style="color:#b91c1c;text-decoration:underline;">${safeButtonUrl}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildEmailText({
  headline,
  intro,
  highlight,
  buttonLabel,
  buttonUrl,
  supportContacts = [],
  closingLine,
}: Omit<EmailFrameOptions, "previewText" | "eyebrow">): string {
  const lines = [
    `LEAD CONFERENCE`,
    "",
    headline,
    "",
    ...intro,
    "",
    highlight,
    "",
    `${buttonLabel}: ${buttonUrl}`,
    "",
    closingLine,
  ];

  if (supportContacts.length > 0) {
    lines.push("", "Questions & Support:", ...supportContacts);
  }

  return lines.join("\n");
}

export { SUPPORT_CONTACTS };