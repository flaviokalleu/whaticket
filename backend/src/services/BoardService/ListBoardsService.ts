import Board from "../../models/Board";
import BoardLane from "../../models/BoardLane";
import BoardTask from "../../models/BoardTask";

const ListBoardsService = async (companyId: number): Promise<Board[]> => {
  const boards = await Board.findAll({
    where: { companyId },
    order: [["name", "ASC"]],
    include: [
      {
        model: BoardLane,
        as: "lanes",
        include: [{ model: BoardTask, as: "tasks" }]
      }
    ]
  });

  return boards;
};

export default ListBoardsService;
