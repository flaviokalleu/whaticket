import ShowGroupService from "./ShowGroupService";

const DeleteGroupService = async (
  groupId: number | string,
  companyId: number
): Promise<void> => {
  const group = await ShowGroupService(groupId, companyId);

  await group.destroy();
};

export default DeleteGroupService;
