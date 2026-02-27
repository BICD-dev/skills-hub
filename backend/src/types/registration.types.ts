// ─────────────────────────────────────────────────────────────────────────────
// registration/registration.types.ts
// ─────────────────────────────────────────────────────────────────────────────

import { PaymentStatus } from "../generated/prisma/enums";


// ── What the frontend sends when submitting the form ─────────────────────────
export interface CreateRegistrationDto {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isMember: boolean;
  branch?: string;           // required if isMember = true
  // add decorator later to validate  that either physical or online course was provided or both
  physicalCourse?: string;    // one course ID
  onlineCourses?: string[];   // one or two course IDs
}

// ── What the service returns after creating a registration ───────────────────
export interface RegistrationCreatedResult {
  registrationId: string;
  paymentReference: string;  // pass this to payment/initiate
  email: string;
  fullName: string;
}

// ── Full registration record (for responses) ─────────────────────────────────
export interface RegistrationRecord {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isMember: boolean;
  branch: string | null;
  physicalCourse: string | null; // Changed from ? to | null
  onlineCourses: string[] | null; // Ensure this matches Prisma too
  paymentStatus: PaymentStatus;
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date; // Don't forget this if Prisma returns it!
}

// ── Validation errors map ─────────────────────────────────────────────────────
export type ValidationErrors = Record<string, string>;