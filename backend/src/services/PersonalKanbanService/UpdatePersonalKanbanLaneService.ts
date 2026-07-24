import ShowPersonalKanbanLaneService from "./ShowPersonalKanbanLaneService";
import PersonalKanbanLane from "../../models/PersonalKanbanLane";

interface LaneData {
  name?: string;
  position?: number;
}

const UpdatePersonalKanbanLaneService = async (
  laneId: number | string,
  userId: number,
  companyId: number,
  laneData: LaneData
): Promise<PersonalKanbanLane> => {
  const lane = await ShowPersonalKanbanLaneService(laneId, userId, companyId);

  await lane.update(laneData);

  return lane;
};

export default UpdatePersonalKanbanLaneService;
