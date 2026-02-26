import express from "express";
import cors from "cors";
import helmet from "helmet";
import configService from "./config/config";
import paymentRouter from "./routes/payment.route";
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

app.get("/", (req, res) => {
  res.send("Welcome to Skills Hub API!");
});

const PORT = configService.getPort();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
