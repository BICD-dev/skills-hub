import { BrevoClient } from "@getbrevo/brevo";
import nodemailer, { Transporter } from "nodemailer";
import configService from "../../config/config";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface EmailClient {
  sendMail(args: SendEmailArgs): Promise<void>;
}

class DisabledEmailClient implements EmailClient {
  async sendMail({ to }: SendEmailArgs): Promise<void> {
    console.log(`[EmailService] Email disabled. Skipping email to ${to}.`);
  }
}

class SmtpEmailClient implements EmailClient {
  private readonly transporter: Transporter;

  constructor(private readonly emailConfig: ReturnType<typeof configService.getEmailConfig>) {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpSecure,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPass,
      },
    });
  }

  async sendMail({ to, subject, html, text }: SendEmailArgs): Promise<void> {
    await this.transporter.sendMail({
      from: `${this.emailConfig.fromName} <${this.emailConfig.fromAddress || this.emailConfig.smtpUser}>`,
      to,
      subject,
      html,
      text,
    });
  }
}

class BrevoEmailClient implements EmailClient {
  private readonly client: BrevoClient;

  constructor(private readonly emailConfig: ReturnType<typeof configService.getEmailConfig>) {
    this.client = new BrevoClient({
      apiKey: emailConfig.brevo.apiKey,
    });
  }

  async sendMail({ to, subject, html, text }: SendEmailArgs): Promise<void> {
    await this.client.transactionalEmails.sendTransacEmail({
      sender: {
        email: this.emailConfig.fromAddress,
        name: this.emailConfig.fromName,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    });
  }
}

export function createEmailClient(
  emailConfig: ReturnType<typeof configService.getEmailConfig>
): EmailClient {
  if (!emailConfig.enabled) {
    return new DisabledEmailClient();
  }

  if (emailConfig.provider === "brevo") {
    return new BrevoEmailClient(emailConfig);
  }

  return new SmtpEmailClient(emailConfig);
}