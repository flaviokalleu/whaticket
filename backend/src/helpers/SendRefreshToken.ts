import { Response } from "express";

// Must match `refreshExpiresIn` in config/auth. Without an explicit maxAge the
// cookie is a session cookie: it dies when the browser closes, forcing a new
// login on every restart even though the refresh token is still valid.
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias

export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, {
    httpOnly: true,
    maxAge: REFRESH_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production"
  });
};
