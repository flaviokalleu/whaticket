import AppError from "../../errors/AppError";
import InternalChatGroup from "../../models/InternalChatGroup";
import InternalChatGroupMember from "../../models/InternalChatGroupMember";
import User from "../../models/User";

const ShowGroupService = async (
  groupId: number | string,
  companyId: number
): Promise<InternalChatGroup> => {
  const group = await InternalChatGroup.findOne({
    where: { id: groupId, companyId },
    include: [
      {
        model: InternalChatGroupMember,
        as: "members",
        include: [{ model: User, attributes: ["id", "name", "email"] }]
      }
    ]
  });

  if (!group) {
    throw new AppError("ERR_INTERNAL_CHAT_GROUP_NOT_FOUND", 404);
  }

  return group;
};

export default ShowGroupService;
