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

  // At least one course must be selected
  const hasPhysical = !!dto.physicalCourse?.trim();
  const hasOnline = Array.isArray(dto.onlineCourses) && dto.onlineCourses.length > 0;

  if (!hasPhysical && !hasOnline) {
    errors.courses = "Please select at least one physical or online course.";
  }

  // Online courses cap still applies if any are selected
  if (hasOnline && dto.onlineCourses!.length > 2) {
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
  const email = dto.email.trim().toLowerCase();

  // 1. Check for an already PAID registration first
  const existingPaid = await prisma.registration.findFirst({
    where: { 
      email: email,
      paymentStatus: PaymentStatus.PAID 
    },
  });

  if (existingPaid) {
    throw new Error(`This email address is already registered and payment has been confirmed.`);
  }

  // 2. Prepare data for the Upsert
  const paymentReference = PaymentService.generateReference("LEAD");
  const amount = Number(process.env.CONFERENCE_FEE ?? 1000);

  // 3. Execute Transaction: Upsert Registration AND Payment
  const result = await prisma.$transaction(async (tx) => {
    // UPSERT Registration: Update if email exists, otherwise Create
    const reg = await tx.registration.upsert({
      where: { email: email },
      update: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone.trim(),
        isMember: dto.isMember,
        branch: dto.isMember ? dto.branch?.trim() ?? null : null,
        physicalCourse: dto.physicalCourse?.trim() ?? null,
        onlineCourses: dto.onlineCourses?.map((c) => c.trim()) ?? [],
        paymentReference: paymentReference, // Update to new reference
        paymentStatus: PaymentStatus.PENDING,
      },
      create: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone.trim(),
        email: email,
        isMember: dto.isMember,
        branch: dto.isMember ? dto.branch?.trim() ?? null : null,
        physicalCourse: dto.physicalCourse?.trim() ?? null,
        onlineCourses: dto.onlineCourses?.map((c) => c.trim()) ?? [],
        paymentReference: paymentReference,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    // UPSERT Payment: Using payment link via registrationId
    // Note: This assumes a unique constraint on registrationId in the Payment table
    await tx.payment.upsert({
      where: { registrationId: reg.id },
      update: {
        reference: paymentReference,
        amount: amount,
        status: PaymentStatus.PENDING,
      },
      create: {
        registrationId: reg.id,
        reference: paymentReference,
        amount: amount,
        currency: "NGN",
        status: PaymentStatus.PENDING,
      },
    });

    return reg;
  });

  return {
    registrationId: result.id,
    paymentReference: result.paymentReference,
    email: result.email,
    fullName: `${result.firstName} ${result.lastName}`,
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

