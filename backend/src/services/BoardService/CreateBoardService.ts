import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Board from "../../models/Board";

interface BoardData {
  name: string;
  createdBy: number;
  companyId: number;
}

const CreateBoardService = async (boardData: BoardData): Promise<Board> => {
  const { name } = boardData;

  const boardSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_BOARD_INVALID_NAME")
      .required("ERR_BOARD_INVALID_NAME")
  });

  try {
    await boardSchema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const board = await Board.create(boardData);

  return board;
};

export default CreateBoardService;
