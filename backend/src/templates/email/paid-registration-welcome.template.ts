import { buildEmailHtml, buildEmailText, SUPPORT_CONTACTS } from "./shared";

interface PaidRegistrationWelcomeTemplateArgs {
  firstName: string;
  groupUrl: string;
}

export function createPaidRegistrationWelcomeTemplate({
  firstName,
  groupUrl,
}: PaidRegistrationWelcomeTemplateArgs): { html: string; text: string } {
  const intro = [
    `Hi ${firstName}, thank you for registering for Lead Conference and choosing to apply for the Skills Hub.`,
    "Your payment has been confirmed, and your registration is now complete.",
  ];
  const highlight =
    "Click the button below to join the WhatsApp group for paid Skills Hub registrants.";
  const closingLine = "If you need any help before the event, reach out to the support contacts below.";

  return {
    html: buildEmailHtml({
      previewText: "Your Lead Conference and Skills Hub registration is confirmed.",
      eyebrow: "Payment Confirmed",
      headline: "Registration Confirmed",
      intro,
      highlight,
      buttonLabel: "Join WhatsApp Group",
      buttonUrl: groupUrl,
      supportContacts: SUPPORT_CONTACTS,
      closingLine,
    }),
    text: buildEmailText({
      headline: "Registration Confirmed",
      intro,
      highlight,
      buttonLabel: "Join WhatsApp Group",
      buttonUrl: groupUrl,
      supportContacts: SUPPORT_CONTACTS,
      closingLine,
    }),
  };
}