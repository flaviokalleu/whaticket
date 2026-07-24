import { Op } from "sequelize";
import InternalChatMessage from "../../models/InternalChatMessage";
import User from "../../models/User";

interface Request {
  userId: number;
  otherUserId: number | string;
  companyId: number;
  pageNumber?: number;
  pageSize?: number;
}

interface Response {
  messages: InternalChatMessage[];
  count: number;
  hasMore: boolean;
}

const ListDirectMessagesService = async ({
  userId,
  otherUserId,
  companyId,
  pageNumber = 1,
  pageSize = 20
}: Request): Promise<Response> => {
  const offset = (pageNumber - 1) * pageSize;

  const { count, rows: messages } = await InternalChatMessage.findAndCountAll(
    {
      where: {
        companyId,
        [Op.or]: [
          { fromUserId: userId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: userId }
        ]
      },
      include: [
        { model: User, as: "fromUser", attributes: ["id", "name", "email"] },
        { model: User, as: "toUser", attributes: ["id", "name", "email"] }
      ],
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]]
    }
  );

  const hasMore = count > offset + messages.length;

  return { messages: messages.reverse(), count, hasMore };
};

export default ListDirectMessagesService;
