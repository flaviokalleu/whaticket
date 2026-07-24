import AppError from "../../errors/AppError";
import PersonalKanbanItem from "../../models/PersonalKanbanItem";

const ShowPersonalKanbanItemService = async (
  itemId: number | string,
  companyId: number
): Promise<PersonalKanbanItem> => {
  const item = await PersonalKanbanItem.findOne({
    where: { id: itemId, companyId }
  });

  if (!item) {
    throw new AppError("ERR_PERSONAL_KANBAN_ITEM_NOT_FOUND", 404);
  }

  return item;
};

export default ShowPersonalKanbanItemService;
