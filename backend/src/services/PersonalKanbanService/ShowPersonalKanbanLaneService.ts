import AppError from "../../errors/AppError";
import PersonalKanbanLane from "../../models/PersonalKanbanLane";

const ShowPersonalKanbanLaneService = async (
  laneId: number | string,
  userId: number,
  companyId: number
): Promise<PersonalKanbanLane> => {
  const lane = await PersonalKanbanLane.findOne({
    where: { id: laneId, userId, companyId }
  });

  if (!lane) {
    throw new AppError("ERR_PERSONAL_KANBAN_LANE_NOT_FOUND", 404);
  }

  return lane;
};

export default ShowPersonalKanbanLaneService;
