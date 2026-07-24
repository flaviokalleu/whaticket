import AppError from "../../errors/AppError";
import InternalChatGroupMember from "../../models/InternalChatGroupMember";
import ShowGroupService from "./ShowGroupService";

interface Request {
  groupId: number | string;
  userId: number | string;
  companyId: number;
}

const RemoveGroupMemberService = async ({
  groupId,
  userId,
  companyId
}: Request): Promise<void> => {
  const group = await ShowGroupService(groupId, companyId);

  const member = await InternalChatGroupMember.findOne({
    where: { groupId: group.id, userId }
  });

  if (!member) {
    throw new AppError("ERR_INTERNAL_CHAT_MEMBER_NOT_FOUND", 404);
  }

  await member.destroy();
};

export default RemoveGroupMemberService;
