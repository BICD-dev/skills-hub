// ─────────────────────────────────────────────────────────────────────────────
// registration/registration.route.ts
// ─────────────────────────────────────────────────────────────────────────────
//
// Mount in app.ts:
//   import registrationRouter from "./registration/registration.route";
//   app.use("/api/registration", registrationRouter);
//
// Routes:
//   POST /api/registration        → Submit form + initiate payment
//   GET  /api/registration        → List all paid registrations (admin only)
//   GET  /api/registration/:id    → Get a single registration by ID
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, json } from "express";
import { RegistrationController } from "../controller/registration.controller";

const registrationRouter = Router();
const registrationController = new RegistrationController();

registrationRouter.use(json());

// ── Submit form & start payment ───────────────────────────────────────────────
registrationRouter.post("/", registrationController.register);

// ── Admin: list all paid registrations ───────────────────────────────────────
// TODO: add your admin auth middleware here, e.g.:
//   registrationRouter.get("/", adminAuthMiddleware, registrationController.getAllPaid);
registrationRouter.get("/", registrationController.getAllPaid);

// ── Get single registration ───────────────────────────────────────────────────
registrationRouter.get("/:id", registrationController.getById);

export default registrationRouter;