import InternalChatMessage from "../../models/InternalChatMessage";
import InternalChatGroupMember from "../../models/InternalChatGroupMember";
import User from "../../models/User";
import AppError from "../../errors/AppError";
import ShowGroupService from "./ShowGroupService";

interface Request {
  groupId: number | string;
  userId: number;
  companyId: number;
  pageNumber?: number;
  pageSize?: number;
}

interface Response {
  messages: InternalChatMessage[];
  count: number;
  hasMore: boolean;
}

const ListGroupMessagesService = async ({
  groupId,
  userId,
  companyId,
  pageNumber = 1,
  pageSize = 20
}: Request): Promise<Response> => {
  const group = await ShowGroupService(groupId, companyId);

  const isMember = await InternalChatGroupMember.findOne({
    where: { groupId: group.id, userId }
  });

  if (!isMember) {
    throw new AppError("ERR_INTERNAL_CHAT_NOT_A_MEMBER", 403);
  }

  const offset = (pageNumber - 1) * pageSize;

  const { count, rows: messages } = await InternalChatMessage.findAndCountAll(
    {
      where: { groupId: group.id, companyId },
      include: [
        { model: User, as: "fromUser", attributes: ["id", "name", "email"] }
      ],
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]]
    }
  );

  const hasMore = count > offset + messages.length;

  return { messages: messages.reverse(), count, hasMore };
};

export default ListGroupMessagesService;
