import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  userId: number | string;
}

const Disable2FAService = async ({ userId }: Request): Promise<User> => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  await user.update({ twoFactorEnabled: false, twoFactorSecret: null });

  return user;
};

export default Disable2FAService;
