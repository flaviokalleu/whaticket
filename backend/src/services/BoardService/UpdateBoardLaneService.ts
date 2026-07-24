import AppError from "../../errors/AppError";
import BoardLane from "../../models/BoardLane";

interface LaneData {
  name?: string;
  color?: string;
  position?: number;
}

const UpdateBoardLaneService = async (
  boardId: number | string,
  laneId: number | string,
  companyId: number,
  laneData: LaneData
): Promise<BoardLane> => {
  const lane = await BoardLane.findOne({
    where: { id: laneId, boardId, companyId }
  });

  if (!lane) {
    throw new AppError("ERR_BOARD_LANE_NOT_FOUND", 404);
  }

  await lane.update(laneData);

  return lane;
};

export default UpdateBoardLaneService;
