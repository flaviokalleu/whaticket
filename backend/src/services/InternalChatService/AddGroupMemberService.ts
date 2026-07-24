import AppError from "../../errors/AppError";
import InternalChatGroupMember from "../../models/InternalChatGroupMember";
import ShowGroupService from "./ShowGroupService";

interface Request {
  groupId: number | string;
  userId: number;
  companyId: number;
}

const AddGroupMemberService = async ({
  groupId,
  userId,
  companyId
}: Request): Promise<InternalChatGroupMember> => {
  const group = await ShowGroupService(groupId, companyId);

  const existing = await InternalChatGroupMember.findOne({
    where: { groupId: group.id, userId }
  });

  if (existing) {
    throw new AppError("ERR_INTERNAL_CHAT_MEMBER_ALREADY_EXISTS");
  }

  const member = await InternalChatGroupMember.create({
    groupId: group.id,
    userId
  });

  return member;
};

export default AddGroupMemberService;
