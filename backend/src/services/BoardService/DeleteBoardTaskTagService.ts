import AppError from "../../errors/AppError";
import BoardTaskTag from "../../models/BoardTaskTag";

const DeleteBoardTaskTagService = async (
  taskId: number | string,
  tagId: number | string,
  companyId: number
): Promise<void> => {
  const tag = await BoardTaskTag.findOne({
    where: { id: tagId, taskId, companyId }
  });

  if (!tag) {
    throw new AppError("ERR_BOARD_TASK_TAG_NOT_FOUND", 404);
  }

  await tag.destroy();
};

export default DeleteBoardTaskTagService;
