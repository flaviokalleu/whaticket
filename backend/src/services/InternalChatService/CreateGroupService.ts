import * as Yup from "yup";
import AppError from "../../errors/AppError";
import InternalChatGroup from "../../models/InternalChatGroup";
import InternalChatGroupMember from "../../models/InternalChatGroupMember";

interface Request {
  name: string;
  createdBy: number;
  companyId: number;
  memberIds?: number[];
}

const CreateGroupService = async ({
  name,
  createdBy,
  companyId,
  memberIds = []
}: Request): Promise<InternalChatGroup> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2, "ERR_INTERNAL_CHAT_INVALID_NAME").required()
  });

  try {
    await schema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const group = await InternalChatGroup.create({
    name,
    createdBy,
    companyId
  });

  const memberSet = new Set<number>([createdBy, ...memberIds]);

  await Promise.all(
    Array.from(memberSet).map(userId =>
      InternalChatGroupMember.create({ groupId: group.id, userId })
    )
  );

  await group.reload({
    include: ["members", "creator"]
  });

  return group;
};

export default CreateGroupService;
