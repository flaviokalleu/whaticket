import BoardTask from "../../models/BoardTask";
import BoardTaskTag from "../../models/BoardTaskTag";
import BoardTaskChecklistItem from "../../models/BoardTaskChecklistItem";

const ListBoardTasksService = async (
  laneId: number | string,
  companyId: number
): Promise<BoardTask[]> => {
  const tasks = await BoardTask.findAll({
    where: { laneId, companyId },
    order: [["position", "ASC"]],
    include: [
      { model: BoardTaskTag, as: "tags" },
      { model: BoardTaskChecklistItem, as: "checklistItems" }
    ]
  });

  return tasks;
};

export default ListBoardTasksService;
