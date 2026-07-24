import AppError from "../../errors/AppError";
import InternalChatMessage from "../../models/InternalChatMessage";
import User from "../../models/User";

interface Request {
  fromUserId: number;
  toUserId: number | string;
  companyId: number;
  body: string;
}

const SendDirectMessageService = async ({
  fromUserId,
  toUserId,
  companyId,
  body
}: Request): Promise<InternalChatMessage> => {
  if (!body || !body.trim()) {
    throw new AppError("ERR_INTERNAL_CHAT_EMPTY_MESSAGE");
  }

  const toUser = await User.findOne({ where: { id: toUserId, companyId } });

  if (!toUser) {
    throw new AppError("ERR_INTERNAL_CHAT_USER_NOT_FOUND", 404);
  }

  const message = await InternalChatMessage.create({
    fromUserId,
    toUserId: toUser.id,
    body,
    companyId
  });

  await message.reload({
    include: [
      { model: User, as: "fromUser", attributes: ["id", "name", "email"] },
      { model: User, as: "toUser", attributes: ["id", "name", "email"] }
    ]
  });

  return message;
};

export default SendDirectMessageService;
