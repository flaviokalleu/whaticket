import { authenticator } from "otplib";
import QRCode from "qrcode";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  userId: number | string;
}

interface Response {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

const Setup2FAService = async ({ userId }: Request): Promise<Response> => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(user.email, "Whaticket", secret);

  await user.update({ twoFactorSecret: secret });

  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return { secret, otpauthUrl, qrCodeDataUrl };
};

export default Setup2FAService;
