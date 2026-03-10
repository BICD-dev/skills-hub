// ─────────────────────────────────────────────────────────────────────────────
// email-preview.route.ts  (DEV ONLY — never mounted in production)
//
// Open these URLs in your browser while the dev server is running:
//   http://localhost:3000/dev/email-preview                 → list of both previews
//   http://localhost:3000/dev/email-preview/attendance      → attendance welcome email
//   http://localhost:3000/dev/email-preview/paid            → paid registration email
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from "express";
import configService from "../config/config";
import { createAttendanceWelcomeTemplate } from "../templates/email/attendance-welcome.template";
import { createPaidRegistrationWelcomeTemplate } from "../templates/email/paid-registration-welcome.template";

const emailPreviewRouter = Router();

// ── Index: links to all previews ─────────────────────────────────────────────
emailPreviewRouter.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Template Previews</title>
    <style>
      body { margin: 0; padding: 48px; background: #f3f0e7; font-family: 'DM Sans', Arial, sans-serif; }
      h1 { margin: 0 0 8px; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; color: #111; }
      p  { margin: 0 0 32px; color: #6b7280; font-size: 14px; }
      ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
      li a {
        display: inline-flex; align-items: center; gap: 12px;
        padding: 16px 24px; background: #111; color: #facc15;
        font-size: 14px; font-weight: 700; letter-spacing: 0.12em;
        text-transform: uppercase; text-decoration: none; border: 2px solid #111;
        box-shadow: 4px 4px 0 #facc15; transition: box-shadow 0.15s;
      }
      li a:hover { box-shadow: 2px 2px 0 #facc15; }
      .badge { background: #facc15; color: #111; padding: 2px 8px; font-size: 11px; }
    </style>
  </head>
  <body>
    <h1>Email Previews</h1>
    <p>Opens the rendered HTML for each transactional email. No SMTP required.</p>
    <ul>
      <li>
        <a href="/dev/email-preview/attendance">
          <span class="badge">1</span>
          Attendance welcome
        </a>
      </li>
      <li>
        <a href="/dev/email-preview/paid">
          <span class="badge">2</span>
          Paid registration confirmation
        </a>
      </li>
    </ul>
  </body>
</html>
`);
});

// ── Preview: attendance-only welcome ─────────────────────────────────────────
emailPreviewRouter.get("/attendance", (_req, res) => {
  const emailConfig = configService.getEmailConfig();
  const { html } = createAttendanceWelcomeTemplate({
    firstName: "John",
    groupUrl: emailConfig.attendanceGroupUrl,
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// ── Preview: paid registration confirmation ───────────────────────────────────
emailPreviewRouter.get("/paid", (_req, res) => {
  const emailConfig = configService.getEmailConfig();
  const { html } = createPaidRegistrationWelcomeTemplate({
    firstName: "John",
    groupUrl: emailConfig.skillsHubGroupUrl,
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

export default emailPreviewRouter;
