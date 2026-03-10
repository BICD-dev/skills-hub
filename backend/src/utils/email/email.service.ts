import nodemailer, { Transporter } from "nodemailer";
import configService from "../../config/config";
import { createAttendanceWelcomeTemplate } from "../../templates/email/attendance-welcome.template";
import { createPaidRegistrationWelcomeTemplate } from "../../templates/email/paid-registration-welcome.template";

// ─── BREVO SMTP CONSTANTS ─────────────────────────────────────────────────────
const BREVO_SMTP_HOST = "smtp-relay.brevo.com";
const BREVO_SMTP_PORT = 587;

// ─── TRANSPORTER FACTORY ──────────────────────────────────────────────────────
function createTransporter(
  emailConfig: ReturnType<typeof configService.getEmailConfig>
): Transporter | null {
  if (!emailConfig.enabled) {
    return null;
  }

  if (emailConfig.provider === "brevo") {
    return nodemailer.createTransport({
      host: BREVO_SMTP_HOST,
      port: BREVO_SMTP_PORT,
      secure: false, // Brevo uses STARTTLS on port 587
      auth: {
        user: emailConfig.brevo.smtpUser,
        pass: emailConfig.brevo.apiKey,
      },
    });
  }

  // Default: generic SMTP (e.g. Gmail, custom)
  return nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: emailConfig.smtpPort,
    secure: emailConfig.smtpSecure,
    auth: {
      user: emailConfig.smtpUser,
      pass: emailConfig.smtpPass,
    },
  });
}

// ─── EMAIL SERVICE ────────────────────────────────────────────────────────────
interface BaseEmailArgs {
  to: string;
  firstName: string;
}

export class EmailService {
  private readonly emailConfig = configService.getEmailConfig();
  private readonly transporter: Transporter | null;

  constructor() {
    this.transporter = createTransporter(this.emailConfig);
  }

  async sendAttendanceOnlyWelcome({ to, firstName }: BaseEmailArgs): Promise<void> {
    const template = createAttendanceWelcomeTemplate({
      firstName,
      groupUrl: this.emailConfig.attendanceGroupUrl,
    });

    await this.sendMail({
      to,
      subject: "Welcome to Lead Conference",
      html: template.html,
      text: template.text,
    });
  }

  async sendPaidRegistrationWelcome({ to, firstName }: BaseEmailArgs): Promise<void> {
    const template = createPaidRegistrationWelcomeTemplate({
      firstName,
      groupUrl: this.emailConfig.skillsHubGroupUrl,
    });

    await this.sendMail({
      to,
      subject: "Your Lead Conference registration is confirmed",
      html: template.html,
      text: template.text,
    });
  }

  private async sendMail({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    if (!this.transporter) {
      console.log(`[EmailService] Email disabled. Skipping email to ${to}.`);
      return;
    }

    const fromAddress = this.emailConfig.fromAddress ||
      (this.emailConfig.provider === "brevo"
        ? this.emailConfig.brevo.smtpUser
        : this.emailConfig.smtpUser);

    await this.transporter.sendMail({
      from: `${this.emailConfig.fromName} <${fromAddress}>`,
      to,
      subject,
      html,
      text,
    });
  }
}