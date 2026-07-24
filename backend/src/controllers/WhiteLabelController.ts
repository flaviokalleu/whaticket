import { Request, Response } from "express";

import GetWhiteLabelService from "../services/SettingServices/GetWhiteLabelService";
import UpdateWhiteLabelService from "../services/SettingServices/UpdateWhiteLabelService";
import UploadWhiteLabelLogoService from "../services/SettingServices/UploadWhiteLabelLogoService";
import UploadWhiteLabelBackgroundService from "../services/SettingServices/UploadWhiteLabelBackgroundService";
import AppError from "../errors/AppError";

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const whiteLabel = await GetWhiteLabelService(companyId);

  return res.status(200).json(whiteLabel);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { appName, primaryColor, logoUrl, backgroundUrl } = req.body;

  await UpdateWhiteLabelService({
    companyId,
    appName,
    primaryColor,
    logoUrl,
    backgroundUrl
  });

  const whiteLabel = await GetWhiteLabelService(companyId);

  return res.status(200).json(whiteLabel);
};

export const uploadLogo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const file = req.file as Express.Multer.File;

  if (!file) {
    throw new AppError("ERR_NO_FILE_UPLOADED", 400);
  }

  const logoUrl = await UploadWhiteLabelLogoService({
    companyId,
    filename: file.filename
  });

  return res.status(200).json({ logoUrl });
};

export const uploadBackground = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const file = req.file as Express.Multer.File;

  if (!file) {
    throw new AppError("ERR_NO_FILE_UPLOADED", 400);
  }

  const backgroundUrl = await UploadWhiteLabelBackgroundService({
    companyId,
    filename: file.filename
  });

  return res.status(200).json({ backgroundUrl });
};
