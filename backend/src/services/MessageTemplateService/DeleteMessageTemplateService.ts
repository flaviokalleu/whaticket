import AppError from "../../errors/AppError";
import MessageTemplate from "../../models/MessageTemplate";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteMessageTemplateService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const template = await MessageTemplate.findOne({
    where: { id, companyId }
  });

  if (!template) {
    throw new AppError("ERR_NO_MESSAGE_TEMPLATE_FOUND", 404);
  }

  await template.destroy();
};

export default DeleteMessageTemplateService;
