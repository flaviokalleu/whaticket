import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import Company from "../models/Company";

const isCompanyActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user?.companyId) {
    return next();
  }

  const company = await Company.findByPk(req.user.companyId);

  if (!company || company.status !== "active") {
    throw new AppError("ERR_COMPANY_BLOCKED", 403);
  }

  return next();
};

export default isCompanyActive;
