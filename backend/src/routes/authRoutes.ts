import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import isAuth from "../middleware/isAuth";

const authRoutes = Router();

// Brute-force protection for credential endpoints only.
const credentialsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." }
});

// Refresh needs its own, far more generous budget: the access token lives for
// 15 minutes, so an active user legitimately refreshes many times per window
// (every page load plus every expiry). Sharing the credentials limiter here
// was logging people out mid-session once the budget ran out.
const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." }
});

authRoutes.post("/signup", credentialsRateLimiter, UserController.store);

authRoutes.post("/login", credentialsRateLimiter, SessionController.store);

authRoutes.post(
  "/refresh_token",
  refreshRateLimiter,
  SessionController.update
);

authRoutes.delete("/logout", isAuth, SessionController.remove);

export default authRoutes;
