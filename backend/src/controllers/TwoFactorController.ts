import { Request, Response } from "express";

import Setup2FAService from "../services/AuthServices/Setup2FAService";
import Enable2FAService from "../services/AuthServices/Enable2FAService";
import Disable2FAService from "../services/AuthServices/Disable2FAService";

export const setup = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.user;

  const { secret, otpauthUrl, qrCodeDataUrl } = await Setup2FAService({
    userId
  });

  return res.status(200).json({ secret, otpauthUrl, qrCodeDataUrl });
};

export const enable = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.user;
  const { token } = req.body;

  const user = await Enable2FAService({ userId, token });

  return res.status(200).json({
    id: user.id,
    twoFactorEnabled: user.twoFactorEnabled
  });
};

export const disable = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId } = req.user;

  const user = await Disable2FAService({ userId });

  return res.status(200).json({
    id: user.id,
    twoFactorEnabled: user.twoFactorEnabled
  });
};
