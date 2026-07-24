import InternalChatMessageRead from "../../models/InternalChatMessageRead";

interface Request {
  userId: number;
  groupId?: number | string | null;
  otherUserId?: number | string | null;
}

const MarkAsReadService = async ({
  userId,
  groupId = null,
  otherUserId = null
}: Request): Promise<InternalChatMessageRead> => {
  const where = groupId
    ? { userId, groupId, otherUserId: null }
    : { userId, otherUserId, groupId: null };

  const [record] = await InternalChatMessageRead.findOrCreate({
    where,
    defaults: { ...where, lastReadAt: new Date() } as any
  });

  await record.update({ lastReadAt: new Date() });

  return record;
};

export default MarkAsReadService;
