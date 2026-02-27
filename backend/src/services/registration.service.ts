// ─────────────────────────────────────────────────────────────────────────────
// registration/registration.service.ts
// All database operations for registrations and payments
// ─────────────────────────────────────────────────────────────────────────────

import { PaymentStatus } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { PaymentService } from "./payment.service";
import {
  CreateRegistrationDto,
  RegistrationCreatedResult,
  RegistrationRecord,
  ValidationErrors,
} from "../types/registration.types";
import { errorHandler } from "../utils/middleware/error.middleware";
import { Prisma } from "../generated/prisma/client";

export class RegistrationService {
  private readonly errorhandler = errorHandler
    // change this to class validator later, fine for now since there is just one dto and not much logic

  validate(dto: CreateRegistrationDto): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!dto.firstName?.trim()) errors.firstName = "First name is required.";
    if (!dto.lastName?.trim()) errors.lastName = "Last name is required.";

    if (!dto.phone?.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\+?[\d\s\-()]{7,15}$/.test(dto.phone.trim())) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (!dto.email?.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (typeof dto.isMember !== "boolean") {
      errors.isMember = "Please indicate your TREM membership status.";
    }

    if (dto.isMember && !dto.branch?.trim()) {
      errors.branch = "Please select your TREM branch.";
    }

    if (!dto.physicalCourse?.trim()) {
      errors.physicalCourse = "Please select a physical course.";
    }

    if (!Array.isArray(dto.onlineCourses) || dto.onlineCourses.length === 0) {
      errors.onlineCourses = "Please select at least one online course.";
    } else if (dto.onlineCourses.length > 2) {
      errors.onlineCourses = "You may select at most two online courses.";
    }

    return errors;
  }

  // ── Create a pending registration ─────────────────────────────────────────
  // This is called BEFORE payment. The registration starts as PENDING.
  // Payment must be confirmed (via webhook or verify endpoint) to mark it PAID.
  async createRegistration(
    dto: CreateRegistrationDto
  ): Promise<RegistrationCreatedResult> {
    // Check for duplicate email
    const existing = await prisma.registration.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });

    if (existing) {
      if (existing.paymentStatus === PaymentStatus.PAID) {
        throw new Error(
          `This email address is already registered and payment has been confirmed.`);
      }

      // If they registered before but never paid, reuse the same record
      // and return the existing reference so they can retry payment.
      // generate a new reference

      const reference = PaymentService.generateReference("LEAD")
      // update db registration and payment
      // await prisma.registration.update({
      //   where:{id:existing.id},
      //   data:{paymentReference:reference}
      // })
      // await prisma.payment.update({
      //   where:{id:existing.id},
      //   data:{reference:reference}
      // })
      return {
        registrationId: existing.id,
        paymentReference: existing.paymentReference,
        email: existing.email,
        fullName: `${existing.firstName} ${existing.lastName}`,
      };
    }

    const paymentReference = PaymentService.generateReference("LEAD");

    // Use a transaction to create both Registration and Payment atomically.
    // If either insert fails, neither is committed.
    const registration = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const reg = await tx.registration.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone.trim(),
          email: dto.email.trim().toLowerCase(),
          isMember: dto.isMember,
          branch: dto.isMember ? dto.branch?.trim() ?? null : null,
          physicalCourse: dto.physicalCourse.trim(),
          onlineCourses: dto.onlineCourses.map((c) => c.trim()),
          paymentStatus: PaymentStatus.PENDING,
          paymentReference,
        },
      });

      await tx.payment.create({
        data: {
          registrationId: reg.id,
          reference: paymentReference,
          amount: Number(process.env.CONFERENCE_FEE ?? 5000),
          currency: "NGN",
          status: PaymentStatus.PENDING,
        },
      });

      return reg;
    });

    return {
      registrationId: registration.id,
      paymentReference: registration.paymentReference,
      email: registration.email,
      fullName: `${registration.firstName} ${registration.lastName}`,
    };
  }

  // ── Mark payment as successful ────────────────────────────────────────────
  // Called by the webhook handler after Kora confirms payment.
  // Runs in a single transaction so both records stay in sync.
  async markPaymentSuccessful(
    reference: string,
    koraRawResponse: unknown
  ): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.payment.findUnique({ where: { reference } });

      if (!payment) {
        throw new Error(
          `[RegistrationService] No payment found for reference: ${reference}`
        );
      }

      // Idempotency guard — don't re-process an already-paid record
      if (payment.status === PaymentStatus.PAID) {
        console.log(
          `[RegistrationService] Payment ${reference} already marked PAID — skipping.`
        );
        return;
      }

      await tx.payment.update({
        where: { reference },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          koraRawResponse: koraRawResponse as object,
        },
      });

      await tx.registration.update({
        where: { paymentReference: reference },
        data: { paymentStatus: PaymentStatus.PAID },
      });
    });

    console.log(
      `[RegistrationService] Registration marked PAID for reference: ${reference}`
    );
  }

  // ── Mark payment as failed ────────────────────────────────────────────────
  async markPaymentFailed(reference: string): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.payment.findUnique({ where: { reference } });

      if (!payment || payment.status === PaymentStatus.PAID) return;

      await tx.payment.update({
        where: { reference },
        data: { status: PaymentStatus.FAILED },
      });

      await tx.registration.update({
        where: { paymentReference: reference },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
    });

    console.log(
      `[RegistrationService] Registration marked FAILED for reference: ${reference}`
    );
  }

  // ── Get registration by payment reference ─────────────────────────────────
  async getByReference(reference: string): Promise<RegistrationRecord | null> {
    const reg = await prisma.registration.findUnique({
      where: { paymentReference: reference },
    });
    return reg ?? null;
  }

  // ── Get registration by ID ────────────────────────────────────────────────
  async getById(id: string): Promise<RegistrationRecord | null> {
    const reg = await prisma.registration.findUnique({ where: { id } });
    return reg ?? null;
  }

  // ── Get all paid registrations (e.g. for admin export) ───────────────────
  async getAllPaid(): Promise<RegistrationRecord[]> {
    return prisma.registration.findMany({
      where: { paymentStatus: PaymentStatus.PAID },
      orderBy: { createdAt: "desc" },
    });
  }
}