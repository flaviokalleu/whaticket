import BoardTaskTag from "../../models/BoardTaskTag";

const ListBoardTaskTagsService = async (
  taskId: number | string,
  companyId: number
): Promise<BoardTaskTag[]> => {
  const tags = await BoardTaskTag.findAll({ where: { taskId, companyId } });

  return tags;
};

export default ListBoardTaskTagsService;
