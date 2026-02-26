// ─────────────────────────────────────────────────────────────────────────────
// payment.types.ts
// Shared types for the payment module
// ─────────────────────────────────────────────────────────────────────────────
 
export interface InitiatePaymentDto {
  amount: number;         // in Naira (e.g. 5000)
  currency?: string;      // defaults to "NGN"
  reference?: string;      // your unique reference (min 8 chars)
  customerName: string;
  customerEmail: string;
  redirectUrl?: string;   // where Kora redirects after payment
  metadata?: Record<string, unknown>;
}

export interface KoraInitResponse {
  status: boolean;
  message: string;
  data: {
    checkout_url: string;
    reference: string;
  };
}

export interface KoraVerifyResponse {
  status: boolean;
  message: string;
  data: {
    amount: number;
    fee: number;
    currency: string;
    status: "success" | "failed" | "processing" | "pending";
    reference: string;
    payment_reference: string;
    transaction_date?: string;
    customer?: {
      name: string;
      email: string;
    };
    metadata?: Record<string, unknown>;
  };
}

export interface KoraWebhookPayload {
  event:
    | "charge.success"
    | "charge.failed"
    | "transfer.success"
    | "transfer.failed"
    | "refund.success"
    | "refund.failed";
  data: {
    amount: number;
    fee: number;
    currency: string;
    status: "success" | "failed";
    reference: string;
    payment_reference?: string;
    transaction_date?: string;
    customer?: { name: string; email: string };
    metadata?: Record<string, unknown>;
  };
}

export interface PaymentInitResult {
  checkoutUrl: string;
  reference: string;
}

export interface PaymentVerifyResult {
  paid: boolean;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}