// ─────────────────────────────────────────────────────────────────────────────
// payment.route.ts
// Registers all payment-related Express routes
// ─────────────────────────────────────────────────────────────────────────────
//
// Mount in your app.ts / server.ts:
//
//   import paymentRouter from "./payment/payment.route";
//   app.use("/api/payment", paymentRouter);
//
// Routes exposed:
//   POST  /api/payment/initiate          → Start a checkout session
//   GET   /api/payment/verify/:reference → Verify payment status
//   POST  /api/payment/webhook           → Kora webhook listener (unauthenticated)
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, json } from "express";
import { PaymentController } from "../controller/payment.controller";
import { PaymentWebhook } from "../webhook/payment.webhook";

const paymentRouter = Router();

const paymentController = new PaymentController();
const paymentWebhook = new PaymentWebhook();

// ── Parse JSON for all payment routes ────────────────────────────────────────
paymentRouter.use(json());

// ── Initiate payment ──────────────────────────────────────────────────────────
// Frontend calls this first to get a Kora checkout URL.
paymentRouter.post("/initiate", paymentController.initiatePayment);

// ── Verify payment ────────────────────────────────────────────────────────────
// Frontend calls this after the user returns from Kora checkout.
// Also useful to poll payment status before allowing form submission.
paymentRouter.get("/verify/:reference", paymentController.verifyPayment);

// ── Webhook ───────────────────────────────────────────────────────────────────
// Kora calls this directly. Must be publicly accessible.
// Register this URL in: Kora Dashboard → Settings → API Configuration → Webhook URL
paymentRouter.post("/webhook", paymentWebhook.handleWebhook);

export default paymentRouter;