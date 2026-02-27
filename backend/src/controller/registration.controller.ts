// ───────
// registration/registration.controller.ts
// ───────

import { Request, Response, NextFunction } from "express";
import { RegistrationService } from "../services/registration.service";
import { PaymentService } from "../services/payment.service";
import { CreateRegistrationDto } from "../types/registration.types";

export class RegistrationController {
  private readonly registrationService: RegistrationService;
  private readonly paymentService: PaymentService;

  constructor() {
    this.registrationService = new RegistrationService();
    this.paymentService = new PaymentService();
  }

  // ── POST /api/registration ────────
  //
  // Full flow in one call:
  //   1. Validate the form data
  //   2. Create a PENDING registration + payment record in the DB
  //   3. Initiate a Kora checkout session
  //   4. Return the checkout URL to the frontend
  //
  // The frontend then redirects the user to Kora to complete payment.
  // After payment, Kora calls our webhook and the user is redirected back
  // to KORAPAY_REDIRECT_URL where the frontend polls /api/payment/verify/:ref
  //
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = req.body as CreateRegistrationDto;

      // ── Step 1: Validate
      const errors = this.registrationService.validate(dto);

      if (Object.keys(errors).length > 0) {
        res.status(422).json({
          success: false,
          message: "Validation failed. Please check the highlighted fields.",
          errors,
        });
        return;
      }

      // ── Step 2: Create registration (or resume existing pending) 
      const registration =
        await this.registrationService.createRegistration(dto);

      // ── Step 3: Initiate Kora payment session ─────────
      const conferenceFeee = Number(process.env.CONFERENCE_FEE ?? 1000);

      const payment = await this.paymentService.initiatePayment({
        amount: conferenceFeee,
        currency: "NGN",
        reference:registration.paymentReference, //
        customerName: registration.fullName,
        customerEmail: registration.email,
        metadata: {
          registrationId: registration.registrationId,
          source: "lead-conference-form",
        },
      });

      // ── Step 4: Return checkout URL ─────────
      res.status(201).json({
        success: true,
        message: "Registration created. Redirect to checkout to complete payment.",
        data: {
          registrationId: registration.registrationId,
          paymentReference: registration.paymentReference,
          checkoutUrl: payment.checkoutUrl,
          amount: conferenceFeee,
          currency: "NGN",
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";

      // Surface duplicate-email errors as a 409 Conflict
      if (message.includes("already registered")) {
        res.status(409).json({ success: false, message });
        return;
      }

      next(error);
    }
  };

  // ── GET /api/registration/:id ─────
  // Fetch a single registration by ID (e.g. to show a confirmation page).
  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const registration = await this.registrationService.getById(id as string);

      if (!registration) {
        res.status(404).json({
          success: false,
          message: "Registration not found.",
        });
        return;
      }

      res.status(200).json({ success: true, data: registration });
    } catch (error) {
      next(error);
    }
  };

  // ── GET /api/registration ─────────
  // Returns all paid registrations.
  // ⚠️  Add your own admin auth middleware before exposing this in production.
  getAllPaid = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const registrations = await this.registrationService.getAllPaid();

      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations,
      });
    } catch (error) {
      next(error);
    }
  };
}