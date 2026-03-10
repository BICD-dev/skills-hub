import { buildEmailHtml, buildEmailText } from "./shared";

interface AttendanceWelcomeTemplateArgs {
  firstName: string;
  groupUrl: string;
}

export function createAttendanceWelcomeTemplate({
  firstName,
  groupUrl,
}: AttendanceWelcomeTemplateArgs): { html: string; text: string } {
  const intro = [
    `Hi ${firstName}, welcome to Lead Conference.`,
    "Your attendance registration has been received successfully.",
  ];
  const highlight =
    "To join the group for everyone who has registered, click the button below.";
  const closingLine = "We look forward to seeing you at Lead Conference.";

  return {
    html: buildEmailHtml({
      previewText: "Your Lead Conference attendance registration is complete.",
      eyebrow: "Attendance Confirmed",
      headline: "Welcome To Lead Conference",
      intro,
      highlight,
      buttonLabel: "Join The Group",
      buttonUrl: groupUrl,
      closingLine,
    }),
    text: buildEmailText({
      headline: "Welcome To Lead Conference",
      intro,
      highlight,
      buttonLabel: "Join The Group",
      buttonUrl: groupUrl,
      closingLine,
    }),
  };
}