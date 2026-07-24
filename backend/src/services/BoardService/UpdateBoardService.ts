import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Board from "../../models/Board";
import ShowBoardService from "./ShowBoardService";

interface BoardData {
  name?: string;
}

const UpdateBoardService = async (
  boardId: number | string,
  companyId: number,
  boardData: BoardData
): Promise<Board> => {
  const { name } = boardData;

  const boardSchema = Yup.object().shape({
    name: Yup.string().min(2, "ERR_BOARD_INVALID_NAME")
  });

  try {
    await boardSchema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const board = await ShowBoardService(boardId, companyId);

  await board.update(boardData);

  return board;
};

export default UpdateBoardService;
