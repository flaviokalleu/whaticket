import MessageTemplate from "../../models/MessageTemplate";

interface Request {
  companyId: number;
}

const ListMessageTemplatesService = async ({
  companyId
}: Request): Promise<MessageTemplate[]> => {
  const templates = await MessageTemplate.findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  return templates;
};

export default ListMessageTemplatesService;
