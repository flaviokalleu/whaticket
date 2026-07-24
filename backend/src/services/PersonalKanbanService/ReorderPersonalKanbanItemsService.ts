import AppError from "../../errors/AppError";
import PersonalKanbanItem from "../../models/PersonalKanbanItem";

interface ItemOrder {
  id: number;
  laneId: number;
  position: number;
}

const ReorderPersonalKanbanItemsService = async (
  companyId: number,
  items: ItemOrder[]
): Promise<PersonalKanbanItem[]> => {
  if (!Array.isArray(items)) {
    throw new AppError("ERR_PERSONAL_KANBAN_ITEM_INVALID_ORDER");
  }

  await Promise.all(
    items.map(async ({ id, laneId, position }) => {
      const [affected] = await PersonalKanbanItem.update(
        { laneId, position },
        { where: { id, companyId } }
      );
      if (!affected) {
        throw new AppError("ERR_PERSONAL_KANBAN_ITEM_NOT_FOUND", 404);
      }
    })
  );

  const ids = items.map(i => i.id);
  const updatedItems = await PersonalKanbanItem.findAll({
    where: { id: ids, companyId },
    order: [["position", "ASC"]]
  });

  return updatedItems;
};

export default ReorderPersonalKanbanItemsService;
