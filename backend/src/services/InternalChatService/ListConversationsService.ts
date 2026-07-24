import { Op } from "sequelize";
import InternalChatGroup from "../../models/InternalChatGroup";
import InternalChatGroupMember from "../../models/InternalChatGroupMember";
import InternalChatMessage from "../../models/InternalChatMessage";
import InternalChatMessageRead from "../../models/InternalChatMessageRead";
import User from "../../models/User";

interface GroupConversation {
  type: "group";
  groupId: number;
  name: string;
  lastMessage: InternalChatMessage | null;
  unreadCount: number;
}

interface DirectConversation {
  type: "direct";
  userId: number;
  name: string;
  lastMessage: InternalChatMessage | null;
  unreadCount: number;
}

type Conversation = GroupConversation | DirectConversation;

const ListConversationsService = async (
  userId: number,
  companyId: number
): Promise<Conversation[]> => {
  const groups = await InternalChatGroup.findAll({
    where: { companyId },
    include: [
      {
        model: InternalChatGroupMember,
        as: "members",
        required: true,
        where: { userId }
      }
    ]
  });

  const groupConversations: GroupConversation[] = await Promise.all(
    groups.map(async group => {
      const lastMessage = await InternalChatMessage.findOne({
        where: { groupId: group.id, companyId },
        order: [["createdAt", "DESC"]]
      });

      const readRecord = await InternalChatMessageRead.findOne({
        where: { userId, groupId: group.id }
      });

      const unreadCount = await InternalChatMessage.count({
        where: {
          groupId: group.id,
          companyId,
          fromUserId: { [Op.ne]: userId },
          createdAt: {
            [Op.gt]: readRecord?.lastReadAt || new Date(0)
          }
        }
      });

      return {
        type: "group" as const,
        groupId: group.id,
        name: group.name,
        lastMessage,
        unreadCount
      };
    })
  );

  const directMessages = await InternalChatMessage.findAll({
    where: {
      companyId,
      groupId: null,
      [Op.or]: [{ fromUserId: userId }, { toUserId: userId }]
    },
    order: [["createdAt", "DESC"]]
  });

  const partnerIds = new Set<number>();
  directMessages.forEach(msg => {
    const partnerId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
    if (partnerId) partnerIds.add(partnerId);
  });

  const directConversations: DirectConversation[] = await Promise.all(
    Array.from(partnerIds).map(async partnerId => {
      const partner = await User.findByPk(partnerId, {
        attributes: ["id", "name", "email"]
      });

      const lastMessage =
        directMessages.find(
          msg =>
            (msg.fromUserId === userId && msg.toUserId === partnerId) ||
            (msg.fromUserId === partnerId && msg.toUserId === userId)
        ) || null;

      const readRecord = await InternalChatMessageRead.findOne({
        where: { userId, otherUserId: partnerId }
      });

      const unreadCount = await InternalChatMessage.count({
        where: {
          companyId,
          fromUserId: partnerId,
          toUserId: userId,
          createdAt: {
            [Op.gt]: readRecord?.lastReadAt || new Date(0)
          }
        }
      });

      return {
        type: "direct" as const,
        userId: partnerId,
        name: partner?.name || "",
        lastMessage,
        unreadCount
      };
    })
  );

  const conversations: Conversation[] = [
    ...groupConversations,
    ...directConversations
  ];

  conversations.sort((a, b) => {
    const aDate = a.lastMessage?.createdAt?.getTime() || 0;
    const bDate = b.lastMessage?.createdAt?.getTime() || 0;
    return bDate - aDate;
  });

  return conversations;
};

export default ListConversationsService;
