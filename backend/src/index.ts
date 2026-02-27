import express from "express";
import cors from "cors";
import helmet from "helmet";
import configService from "./config/config";
import paymentRouter from "./routes/payment.route";
import { errorHandler } from "./utils/middleware/error.middleware";
import registrationRouter from "./routes/registration.route";
const app = express();

// validate env variables on startup
try {
  configService.validate();
  console.log(" Environment variables validated successfully");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
}

//  middlewarea
app.use(helmet());
app.use(cors());
app.use(express.json());

// routes
app.use("/api/payment", paymentRouter);
app.use("/api/registration", registrationRouter);

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