import InternalChatGroup from "../../models/InternalChatGroup";
import InternalChatGroupMember from "../../models/InternalChatGroupMember";
import User from "../../models/User";

const ListGroupsService = async (
  userId: number,
  companyId: number
): Promise<InternalChatGroup[]> => {
  const groups = await InternalChatGroup.findAll({
    where: { companyId },
    include: [
      {
        model: InternalChatGroupMember,
        as: "members",
        required: true,
        where: { userId },
        include: [{ model: User, attributes: ["id", "name", "email"] }]
      }
    ],
    order: [["updatedAt", "DESC"]]
  });

  return groups;
};

export default ListGroupsService;
