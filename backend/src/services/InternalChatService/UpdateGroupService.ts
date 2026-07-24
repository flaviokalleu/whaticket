import InternalChatGroup from "../../models/InternalChatGroup";
import ShowGroupService from "./ShowGroupService";

interface Request {
  groupId: number | string;
  companyId: number;
  name: string;
}

const UpdateGroupService = async ({
  groupId,
  companyId,
  name
}: Request): Promise<InternalChatGroup> => {
  const group = await ShowGroupService(groupId, companyId);

  await group.update({ name });

  return group;
};

export default UpdateGroupService;
