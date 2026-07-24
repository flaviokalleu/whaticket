import AppError from "../../errors/AppError";
import Board from "../../models/Board";
import BoardLane from "../../models/BoardLane";
import BoardTask from "../../models/BoardTask";
import BoardTaskTag from "../../models/BoardTaskTag";
import BoardTaskChecklistItem from "../../models/BoardTaskChecklistItem";

const ShowBoardService = async (
  boardId: number | string,
  companyId: number
): Promise<Board> => {
  const board = await Board.findOne({
    where: { id: boardId, companyId },
    include: [
      {
        model: BoardLane,
        as: "lanes",
        include: [
          {
            model: BoardTask,
            as: "tasks",
            include: [
              { model: BoardTaskTag, as: "tags" },
              { model: BoardTaskChecklistItem, as: "checklistItems" }
            ]
          }
        ]
      }
    ]
  });

  if (!board) {
    throw new AppError("ERR_BOARD_NOT_FOUND", 404);
  }

  return board;
};

export default ShowBoardService;
