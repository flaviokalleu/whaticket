import AppError from "../../errors/AppError";
import InternalChatMessage from "../../models/InternalChatMessage";
import InternalChatGroupMember from "../../models/InternalChatGroupMember";
import User from "../../models/User";
import ShowGroupService from "./ShowGroupService";

interface Request {
  groupId: number | string;
  fromUserId: number;
  companyId: number;
  body: string;
}

const SendGroupMessageService = async ({
  groupId,
  fromUserId,
  companyId,
  body
}: Request): Promise<InternalChatMessage> => {
  if (!body || !body.trim()) {
    throw new AppError("ERR_INTERNAL_CHAT_EMPTY_MESSAGE");
  }

  const group = await ShowGroupService(groupId, companyId);

  const isMember = await InternalChatGroupMember.findOne({
    where: { groupId: group.id, userId: fromUserId }
  });

  if (!isMember) {
    throw new AppError("ERR_INTERNAL_CHAT_NOT_A_MEMBER", 403);
  }

  const message = await InternalChatMessage.create({
    groupId: group.id,
    fromUserId,
    body,
    companyId
  });

  await message.reload({
    include: [{ model: User, as: "fromUser", attributes: ["id", "name", "email"] }]
  });

  return message;
};

export default SendGroupMessageService;
