import AppError from "../../errors/AppError";
import PersonalKanbanLane from "../../models/PersonalKanbanLane";

interface LaneOrder {
  id: number;
  position: number;
}

const ReorderPersonalKanbanLanesService = async (
  userId: number,
  companyId: number,
  lanes: LaneOrder[]
): Promise<PersonalKanbanLane[]> => {
  if (!Array.isArray(lanes)) {
    throw new AppError("ERR_PERSONAL_KANBAN_LANE_INVALID_ORDER");
  }

  await Promise.all(
    lanes.map(async ({ id, position }) => {
      const [affected] = await PersonalKanbanLane.update(
        { position },
        { where: { id, userId, companyId } }
      );
      if (!affected) {
        throw new AppError("ERR_PERSONAL_KANBAN_LANE_NOT_FOUND", 404);
      }
    })
  );

  const updatedLanes = await PersonalKanbanLane.findAll({
    where: { userId, companyId },
    order: [["position", "ASC"]]
  });

  return updatedLanes;
};

export default ReorderPersonalKanbanLanesService;
