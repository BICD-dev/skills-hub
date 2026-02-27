// ─────────────────────────────────────────────────────────────────────────────
// payment.service.ts
// Handles all communication with the Korapay API
// ─────────────────────────────────────────────────────────────────────────────

import crypto from "crypto";
import configService from "../config/config";
import {
  InitiatePaymentDto,
  KoraInitResponse,
  KoraVerifyResponse,
  KoraWebhookPayload,
  PaymentInitResult,
  PaymentVerifyResult,

} from "../types/payment.types";
import { PaymentStatus } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";
export class PaymentService {
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor() {
    const korapayConfig = configService.getKorapayConfig();
    
    this.baseUrl = korapayConfig.apiBaseUrl;
    this.secretKey = korapayConfig.secretKey;
    this.publicKey = korapayConfig.publicKey;
  }

  // ── Private helper: build auth headers ──────────────────────────────────────
  private get authHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.secretKey}`,
    };
  }

  // ── Initiate a Checkout payment ──────────────────────────────────────────────
  // Creates a hosted checkout session on Kora and returns the checkout URL.
  // The frontend redirects the user there (or embeds the Kora inline widget).
  async initiatePayment(dto: InitiatePaymentDto): Promise<PaymentInitResult> {
    const korapayConfig = configService.getKorapayConfig();
    // generate a new reference every time we initiate a payment, even if the caller doesn't provide one. This ensures uniqueness and prevents potential issues with duplicate references. If the caller provides a reference, we can use it (after validating it meets Kora's requirements), but if they don't, we generate one automatically.
    const reference = dto.reference 

    // build payload
    const payload = {
      reference,
      amount: dto.amount,
      currency: dto.currency ?? "NGN",
      redirect_url:
        dto.redirectUrl ?? korapayConfig.redirectUrl ?? "",
      customer: {
        name: dto.customerName,
        email: dto.customerEmail,
      },
      notification_url:
        korapayConfig.webhookUrl ?? "",        // optional override
      metadata: dto.metadata ?? {},
    };

    const response = await fetch(`${this.baseUrl}/charges/initialize`, {
      method: "POST",
      headers: this.authHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Kora initiate failed [${response.status}]: ${errText}`);
    }

    const result: KoraInitResponse = await response.json();

    if (!result.status || !result.data?.checkout_url) {
      throw new Error(`Kora initiation error: ${result.message}`);
    }

    return {
      checkoutUrl: result.data.checkout_url,
      reference: result.data.reference,
    };
  }

  // ── Verify a payment by reference ────────────────────────────────────────────
  // Call this BEFORE giving value to the customer (after webhook or redirect).
  async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
    const response = await fetch(
      `${this.baseUrl}/charges/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: this.authHeaders,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Kora verify failed [${response.status}]: ${errText}`);
    }

    const result: KoraVerifyResponse = await response.json();

    if (!result.status) {
      throw new Error(`Kora verification error: ${result.message}`);
    }

    const { data } = result;
    // update the payment status and the paidAt timestap also the kora response 
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.payment.update({
        where: { reference },
        data: {
          status: data.status === "success" ? PaymentStatus.PAID : PaymentStatus.FAILED,
          paidAt: data.status === "success" ? new Date() : null,
          koraRawResponse: data as object,
        },
      });

      await tx.registration.updateMany({
        where: { paymentReference: reference },
        data: {
          paymentStatus: data.status === "success" ? PaymentStatus.PAID : PaymentStatus.FAILED,
        },
      });
    });

    return {
      paid: data.status === "success",
      status: data.status,
      reference: data.reference,
      amount: data.amount,
      currency: data.currency,
    };
  }

  // ── Validate a webhook signature ─────────────────────────────────────────────
  // Kora signs the `data` object with your secret key using HMAC-SHA256.
  // The signature is in the `x-korapay-signature` header.
  validateWebhookSignature(
    rawDataObject: unknown,
    incomingSignature: string
  ): boolean {
    const hash = crypto
      .createHmac("sha256", this.secretKey)
      .update(JSON.stringify(rawDataObject))
      .digest("hex");

    return hash === incomingSignature;
  }

  // ── Process a verified webhook payload ───────────────────────────────────────
  // Returns a structured summary of the event.
  processWebhookPayload(payload: KoraWebhookPayload): {
    event: string;
    reference: string;
    isSuccess: boolean;
    amount: number;
    currency: string;
    customerEmail?: string;
  } {
    return {
      event: payload.event,
      reference: payload.data.reference,
      isSuccess: payload.data.status === "success",
      amount: payload.data.amount,
      currency: payload.data.currency,
      customerEmail: payload.data.customer?.email,
    };
  }

  // ── Generate a unique payment reference ──────────────────────────────────────
  // Prefix + timestamp + random suffix. Min 8 chars required by Kora.
  static generateReference(prefix = "LEAD"): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
