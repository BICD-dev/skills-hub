// ─────────────────────────────────────────────────────────────────────────────
// payment.controller.ts
// Handles HTTP request/response logic for payment endpoints
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { RegistrationService } from "../services/registration.service";

export class PaymentController {
  private readonly paymentService: PaymentService;
  private readonly registrationService: RegistrationService;

  constructor() {
    this.paymentService = new PaymentService();
    this.registrationService = new RegistrationService();
  }

  // ── POST /api/payment/initiate ───────────────────────────────────────────────
  // Called by the frontend when the user clicks "Pay Now".
  // Returns a Kora checkout URL the frontend redirects (or pops up) to.
  //
  // Request body:
  //   {
  //     amount: number,          (in Naira)
  //     customerName: string,
  //     customerEmail: string,
  //     metadata?: object        (optional: attach form data for reconciliation)
  //   }
  initiatePayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { amount, customerName, customerEmail, metadata } = req.body;

      // ── Basic validation ────────────────────────────────────────────────────
      if (!amount || typeof amount !== "number" || amount <= 0) {
        res.status(400).json({
          success: false,
          message: "A valid positive amount (in Naira) is required.",
        });
        return;
      }

      if (!customerName || !customerEmail) {
        res.status(400).json({
          success: false,
          message: "customerName and customerEmail are required.",
        });
        return;
      }
    //   generate this inside service instead of controller, since the controller should be as thin as possible and not contain business logic. The service can have a helper function to generate the reference, and the controller just calls it when needed.
      // ── Generate reference ──────────────────────────────────────────────────
      const reference = PaymentService.generateReference("LEAD");

      // ── Call service ────────────────────────────────────────────────────────
      const result = await this.paymentService.initiatePayment({
        amount,
        currency: "NGN",
        reference,
        customerName,
        customerEmail,
        redirectUrl: process.env.KORAPAY_REDIRECT_URL,
        metadata,
      });

      res.status(200).json({
        success: true,
        message: "Payment session initiated.",
        data: {
          checkoutUrl: result.checkoutUrl,
          reference: result.reference,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ── GET /api/payment/verify/:reference ──────────────────────────────────────
  // Polled by the frontend after the user returns from Kora checkout,
  // OR after the redirect_url callback.
  // Always re-verify server-side — never trust the client's claim of success.
  verifyPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { reference } = req.params;

      if (!reference) {
        res.status(400).json({
          success: false,
          message: "Payment reference is required.",
        });
        return;
      }

      const verifiedPayment = await this.paymentService.verifyPayment(reference as string);

      if (verifiedPayment.paid) {
        await this.registrationService.markPaymentSuccessful(
          reference as string,
          verifiedPayment
        );
      } else if (verifiedPayment.status === "failed") {
        await this.registrationService.markPaymentFailed(reference as string);
      }

      if (verifiedPayment.paid) {
        res.status(200).json({
          success: true,
          message: "Payment verified successfully.",
          data: verifiedPayment,
        });
      } else {
        res.status(402).json({
          success: false,
          message: `Payment not completed. Current status: ${verifiedPayment.status}.`,
          data: verifiedPayment,
        });
      }
    } catch (error) {
      next(error);
    }
  };
}