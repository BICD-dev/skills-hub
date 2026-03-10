import configService from "../../config/config";
import { createAttendanceWelcomeTemplate } from "../../templates/email/attendance-welcome.template";
import { createPaidRegistrationWelcomeTemplate } from "../../templates/email/paid-registration-welcome.template";
import { createEmailClient } from "./email.client";
// ─── EMAIL SERVICE ────────────────────────────────────────────────────────────
interface BaseEmailArgs {
  to: string;
  firstName: string;
}

export class EmailService {
  private readonly emailConfig = configService.getEmailConfig();
  private readonly emailClient = createEmailClient(this.emailConfig);

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
    await this.emailClient.sendMail({
      to,
      subject,
      html,
      text,
    });
  }
}

