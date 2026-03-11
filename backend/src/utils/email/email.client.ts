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

interface EmailHealthCheckResult {
  ok: boolean;
  provider: "smtp" | "brevo" | "disabled";
  message: string;
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

export async function runEmailHealthCheck(): Promise<EmailHealthCheckResult> {
  const emailConfig = configService.getEmailConfig();

  if (!emailConfig.enabled) {
    return {
      ok: true,
      provider: "disabled",
      message: "Email is disabled. Skipping health check.",
    };
  }

  if (emailConfig.provider === "brevo") {
    const client = new BrevoClient({
      apiKey: emailConfig.brevo.apiKey,
    });

    try {
      const account = await client.account.getAccount();

      return {
        ok: true,
        provider: "brevo",
        message: `Brevo API reachable for account ${account.email}.`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Brevo error";

      return {
        ok: false,
        provider: "brevo",
        message: `Brevo health check failed: ${message}`,
      };
    }
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.smtpHost,
    port: emailConfig.smtpPort,
    secure: emailConfig.smtpSecure,
    auth: {
      user: emailConfig.smtpUser,
      pass: emailConfig.smtpPass,
    },
  });

  try {
    await transporter.verify();

    return {
      ok: true,
      provider: "smtp",
      message: `SMTP server reachable at ${emailConfig.smtpHost}:${emailConfig.smtpPort}.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown SMTP error";

    return {
      ok: false,
      provider: "smtp",
      message: `SMTP health check failed: ${message}`,
    };
  }
}