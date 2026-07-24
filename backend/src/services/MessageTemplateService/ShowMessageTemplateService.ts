import AppError from "../../errors/AppError";
import MessageTemplate from "../../models/MessageTemplate";

interface Request {
  id: string | number;
  companyId: number;
}

const ShowMessageTemplateService = async ({
  id,
  companyId
}: Request): Promise<MessageTemplate> => {
  const template = await MessageTemplate.findOne({
    where: { id, companyId }
  });

  if (!template) {
    throw new AppError("ERR_NO_MESSAGE_TEMPLATE_FOUND", 404);
  }

  return template;
};

export default ShowMessageTemplateService;
