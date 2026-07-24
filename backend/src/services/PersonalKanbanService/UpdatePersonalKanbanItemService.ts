import PersonalKanbanItem from "../../models/PersonalKanbanItem";
import ShowPersonalKanbanItemService from "./ShowPersonalKanbanItemService";

interface ItemData {
  title?: string;
  description?: string;
  position?: number;
  laneId?: number;
}

const UpdatePersonalKanbanItemService = async (
  itemId: number | string,
  companyId: number,
  itemData: ItemData
): Promise<PersonalKanbanItem> => {
  const item = await ShowPersonalKanbanItemService(itemId, companyId);

  await item.update(itemData);

  return item;
};

export default UpdatePersonalKanbanItemService;
