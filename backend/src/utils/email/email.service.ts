import nodemailer, { Transporter } from "nodemailer";
import configService from "../../config/config";
import { createAttendanceWelcomeTemplate } from "../../templates/email/attendance-welcome.template";
import { createPaidRegistrationWelcomeTemplate } from "../../templates/email/paid-registration-welcome.template";

interface BaseEmailArgs {
  to: string;
  firstName: string;
}

export class EmailService {
  private readonly emailConfig = configService.getEmailConfig();
  private readonly transporter: Transporter | null;

  constructor() {
    this.transporter = this.createTransporter();
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

  private createTransporter(): Transporter | null {
    if (!this.emailConfig.enabled) {
      return null;
    }

    return nodemailer.createTransport({
      host: this.emailConfig.smtpHost,
      port: this.emailConfig.smtpPort,
      secure: this.emailConfig.smtpSecure,
      auth: {
        user: this.emailConfig.smtpUser,
        pass: this.emailConfig.smtpPass,
      },
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

    await this.transporter.sendMail({
      from: `${this.emailConfig.fromName} <${this.emailConfig.fromAddress || this.emailConfig.smtpUser}>`,
      to,
      subject,
      html,
      text,
    });
  }
}