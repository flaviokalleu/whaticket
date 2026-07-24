import ShowBoardTaskService from "./ShowBoardTaskService";

const DeleteBoardTaskService = async (
  taskId: number | string,
  companyId: number
): Promise<void> => {
  const task = await ShowBoardTaskService(taskId, companyId);

  await task.destroy();
};

export default DeleteBoardTaskService;
