import * as Yup from "yup";
import AppError from "../../errors/AppError";
import PersonalKanbanLane from "../../models/PersonalKanbanLane";
import PersonalKanbanItem from "../../models/PersonalKanbanItem";

interface ItemData {
  title: string;
  description?: string;
  position?: number;
  laneId: number;
  companyId: number;
}

const CreatePersonalKanbanItemService = async (
  itemData: ItemData
): Promise<PersonalKanbanItem> => {
  const { title, laneId, companyId } = itemData;

  const itemSchema = Yup.object().shape({
    title: Yup.string()
      .min(1, "ERR_PERSONAL_KANBAN_ITEM_INVALID_TITLE")
      .required("ERR_PERSONAL_KANBAN_ITEM_INVALID_TITLE")
  });

  try {
    await itemSchema.validate({ title });
  } catch (err) {
    throw new AppError(err.message);
  }

  const lane = await PersonalKanbanLane.findOne({
    where: { id: laneId, companyId }
  });

  if (!lane) {
    throw new AppError("ERR_PERSONAL_KANBAN_LANE_NOT_FOUND", 404);
  }

  let { position } = itemData;

  if (position === undefined) {
    const lastItem = await PersonalKanbanItem.findOne({
      where: { laneId, companyId },
      order: [["position", "DESC"]]
    });
    position = lastItem ? lastItem.position + 1 : 0;
  }

  const item = await PersonalKanbanItem.create({ ...itemData, position });

  return item;
};

export default CreatePersonalKanbanItemService;
