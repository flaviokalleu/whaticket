import { authenticator } from "otplib";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  userId: number | string;
  token: string;
}

const Validate2FALoginService = async ({
  userId,
  token
}: Request): Promise<boolean> => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AppError("ERR_2FA_NOT_ENABLED", 400);
  }

  const isValid = authenticator.verify({
    token,
    secret: user.twoFactorSecret
  });

  if (!isValid) {
    throw new AppError("ERR_INVALID_2FA_TOKEN", 400);
  }

  return true;
};

export default Validate2FALoginService;
