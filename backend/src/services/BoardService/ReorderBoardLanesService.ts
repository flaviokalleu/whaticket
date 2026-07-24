import AppError from "../../errors/AppError";
import BoardLane from "../../models/BoardLane";

interface LaneOrder {
  id: number;
  position: number;
}

const ReorderBoardLanesService = async (
  boardId: number | string,
  companyId: number,
  lanes: LaneOrder[]
): Promise<BoardLane[]> => {
  if (!Array.isArray(lanes)) {
    throw new AppError("ERR_BOARD_LANE_INVALID_ORDER");
  }

  await Promise.all(
    lanes.map(async ({ id, position }) => {
      const [affected] = await BoardLane.update(
        { position },
        { where: { id, boardId, companyId } }
      );
      if (!affected) {
        throw new AppError("ERR_BOARD_LANE_NOT_FOUND", 404);
      }
    })
  );

  const updatedLanes = await BoardLane.findAll({
    where: { boardId, companyId },
    order: [["position", "ASC"]]
  });

  return updatedLanes;
};

export default ReorderBoardLanesService;
