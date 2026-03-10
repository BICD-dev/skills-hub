import express from "express";
import cors from "cors";
import helmet from "helmet";
import configService from "./config/config";
import paymentRouter from "./routes/payment.route";
import { errorHandler } from "./utils/middleware/error.middleware";
import registrationRouter from "./routes/registration.route";
import emailPreviewRouter from "./routes/email-preview.route";
import { runEmailHealthCheck } from "./utils/email/email.client";
const app = express();

// validate env variables on startup
try {
  configService.validate();
  console.log(" Environment variables validated successfully");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
}

void runEmailHealthCheck().then((result) => {
  const log = result.ok ? console.log : console.error;
  log(`[EmailHealthCheck:${result.provider}] ${result.message}`);
});

//  middlewarea
app.use(helmet());
app.use(cors());
app.use(express.json());

// routes
app.use("/api/payment", paymentRouter);
app.use("/api/registration", registrationRouter);

// ── Dev-only email preview (never active in production) ───────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use("/dev/email-preview", emailPreviewRouter);
}

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Welcome to Skills Hub API!");
});

const PORT = configService.getPort();
// Only listen when running locally, not on Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;