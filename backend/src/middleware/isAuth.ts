import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import { logger } from "../utils/logger";
import User from "../models/User";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  let payload: TokenPayload;

  try {
    payload = verify(token, authConfig.secret) as TokenPayload;
  } catch (err) {
    logger.warn(err, "isAuth: token verification failed");
    throw new AppError(
      "Invalid token. We'll try to assign a new one on next request",
      403
    );
  }

  const { id, profile } = payload;
  let { companyId } = payload;

  // Tokens issued before multi-tenancy was introduced carry no companyId.
  // Resolve it from the user record so existing sessions keep working
  // instead of failing with a not-null violation deeper in the stack.
  if (!companyId) {
    const user = await User.findByPk(id, { attributes: ["companyId"] });

    if (!user?.companyId) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    companyId = user.companyId;
  }

  req.user = { id, profile, companyId };

  return next();
};

export default isAuth;
