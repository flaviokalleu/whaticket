import AppError from "../../errors/AppError";
import BoardLane from "../../models/BoardLane";

const DeleteBoardLaneService = async (
  boardId: number | string,
  laneId: number | string,
  companyId: number
): Promise<void> => {
  const lane = await BoardLane.findOne({
    where: { id: laneId, boardId, companyId }
  });

  if (!lane) {
    throw new AppError("ERR_BOARD_LANE_NOT_FOUND", 404);
  }

  await lane.destroy();
};

export default DeleteBoardLaneService;
