import { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "crypto";

import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import ListSettingByValueService from "../services/SettingServices/ListSettingByValueService";

const safeCompare = (a: string, b: string): boolean => {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
};

const isAuthApi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const getToken = await ListSettingByValueService(token);
    if (!getToken) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    if (!safeCompare(getToken.value, token)) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
  } catch (err) {
    logger.warn(err, "isAuthApi: token verification failed");
    throw new AppError(
      "Invalid token. We'll try to assign a new one on next request",
      403
    );
  }

  return next();
};

export default isAuthApi;
