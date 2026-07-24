import ShowPersonalKanbanItemService from "./ShowPersonalKanbanItemService";

const DeletePersonalKanbanItemService = async (
  itemId: number | string,
  companyId: number
): Promise<void> => {
  const item = await ShowPersonalKanbanItemService(itemId, companyId);

  await item.destroy();
};

export default DeletePersonalKanbanItemService;
