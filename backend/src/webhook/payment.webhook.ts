// ─────────────────────────────────────────────────────────────────────────────
// payment/payment.webhook.ts  (updated — wired to RegistrationService)
// ─────────────────────────────────────────────────────────────────────────────
//
// ⚠️  SETUP:
//   1. Register this URL in: Kora Dashboard → Settings → API Configuration → Webhook URL
//   2. Must be publicly accessible (use ngrok locally: ngrok http 3000)
//   3. Must be unauthenticated — Kora calls it directly
//   4. Always respond 200 immediately; do work after responding
//
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { RegistrationService } from "../services/registration.service";
import { KoraWebhookPayload } from "../types/payment.types";

export class PaymentWebhook {
  private readonly paymentService: PaymentService;
  private readonly registrationService: RegistrationService;

  constructor() {
    this.paymentService = new PaymentService();
    this.registrationService = new RegistrationService();
  }

  // ── POST /api/payment/webhook ─────────────────────────────────────────────
  handleWebhook = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    try {
      // ── Step 1: Check signature header exists ─────────────────────────────
      const incomingSignature = req.headers["x-korapay-signature"] as string;

      if (!incomingSignature) {
        console.warn("[Webhook] Rejected: missing x-korapay-signature header.");
        res.status(400).json({ message: "Missing signature header." });
        return;
      }

      const payload = req.body as KoraWebhookPayload;

      // ── Step 2: Validate HMAC signature ──────────────────────────────────
      // Kora signs the `data` object (not the full payload) with your secret key.
      const isValid = this.paymentService.validateWebhookSignature(
        payload.data,
        incomingSignature
      );

      if (!isValid) {
        console.warn(
          `[Webhook] Rejected: invalid signature for ref: ${payload?.data?.reference}`
        );
        res.status(401).json({ message: "Invalid webhook signature." });
        return;
      }

      // ── Step 3: Acknowledge immediately ───────────────────────────────────
      // Kora will retry if it doesn't get a 200 quickly. Respond first.
      res.status(200).json({ message: "Webhook received." });

      // ── Step 4: Process event asynchronously ──────────────────────────────
      this.processEvent(payload).catch((err) =>
        console.error("[Webhook] processEvent error:", err)
      );
    } catch (error) {
      console.error("[Webhook] Unhandled top-level error:", error);
      // Still respond 200 so Kora doesn't retry unnecessarily.
      if (!res.headersSent) {
        res.status(200).json({ message: "Received." });
      }
    }
  };

  // ── Route to the right handler by event type ──────────────────────────────
  private async processEvent(payload: KoraWebhookPayload): Promise<void> {
    const { event, data } = payload;

    console.log(`[Webhook] Processing event: ${event}`, {
      reference: data.reference,
      status: data.status,
      amount: data.amount,
    });

    switch (event) {
      case "charge.success":
        await this.onChargeSuccess(data.reference, payload);
        break;

      case "charge.failed":
        await this.onChargeFailed(data.reference);
        break;

      case "transfer.success":
      case "transfer.failed":
        // Handle payout events here if you use Kora payouts later.
        console.log(`[Webhook] Transfer event received: ${event} — ref: ${data.reference}`);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event}`);
    }
  }

  // ── charge.success ─────────────────────────────────────────────────────────
  private async onChargeSuccess(
    reference: string,
    rawPayload: KoraWebhookPayload
  ): Promise<void> {
    // Re-verify directly with Kora — never trust the webhook payload alone.
    const verified = await this.paymentService.verifyPayment(reference);

    if (!verified.paid) {
      console.warn(
        `[Webhook] charge.success received but Kora re-verification returned status: ${verified.status} for ref: ${reference}`
      );
      return;
    }

    // Update both Payment and Registration rows in one transaction.
    await this.registrationService.markPaymentSuccessful(
      reference,
      rawPayload.data   // stored as koraRawResponse for audit purposes
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TODO: hook in your email service here, e.g.:
    //
    //   const reg = await this.registrationService.getByReference(reference);
    //   if (reg) {
    //     await emailService.sendConfirmation({
    //       to: reg.email,
    //       name: `${reg.firstName} ${reg.lastName}`,
    //       reference,
    //     });
    //   }
    //
    // ─────────────────────────────────────────────────────────────────────────
  }

  // ── charge.failed ──────────────────────────────────────────────────────────
  private async onChargeFailed(reference: string): Promise<void> {
    await this.registrationService.markPaymentFailed(reference);

    // ─────────────────────────────────────────────────────────────────────────
    // TODO: hook in your email service here, e.g.:
    //
    //   const reg = await this.registrationService.getByReference(reference);
    //   if (reg) {
    //     await emailService.sendPaymentFailedNotice({ to: reg.email });
    //   }
    //
    // ─────────────────────────────────────────────────────────────────────────
  }
}