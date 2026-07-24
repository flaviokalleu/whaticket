import AppError from "../../errors/AppError";
import Board from "../../models/Board";
import BoardLane from "../../models/BoardLane";

interface LaneData {
  name: string;
  color?: string;
  position?: number;
}

const CreateBoardLaneService = async (
  boardId: number | string,
  companyId: number,
  laneData: LaneData
): Promise<BoardLane> => {
  const board = await Board.findOne({ where: { id: boardId, companyId } });

  if (!board) {
    throw new AppError("ERR_BOARD_NOT_FOUND", 404);
  }

  let { position } = laneData;

  if (position === undefined) {
    const lastLane = await BoardLane.findOne({
      where: { boardId, companyId },
      order: [["position", "DESC"]]
    });
    position = lastLane ? lastLane.position + 1 : 0;
  }

  const lane = await BoardLane.create({
    ...laneData,
    position,
    boardId: +boardId,
    companyId
  });

  return lane;
};

export default CreateBoardLaneService;
