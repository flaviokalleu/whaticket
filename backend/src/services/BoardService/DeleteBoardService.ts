import ShowBoardService from "./ShowBoardService";

const DeleteBoardService = async (
  boardId: number | string,
  companyId: number
): Promise<void> => {
  const board = await ShowBoardService(boardId, companyId);

  await board.destroy();
};

export default DeleteBoardService;
