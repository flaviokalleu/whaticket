import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";

const authRoutes = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." }
});

authRoutes.post("/signup", authRateLimiter, UserController.store);

authRoutes.post("/login", authRateLimiter, SessionController.store);

authRoutes.post(
  "/refresh_token",
  authRateLimiter,
  SessionController.update
);

authRoutes.delete("/logout", isAuth, SessionController.remove);

export default authRoutes;
