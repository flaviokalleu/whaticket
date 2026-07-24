import AppError from "../../errors/AppError";
import MessageTemplate from "../../models/MessageTemplate";

interface Request {
  id: string | number;
  companyId: number;
  name?: string;
  body?: string;
}

const UpdateMessageTemplateService = async ({
  id,
  companyId,
  ...updateData
}: Request): Promise<MessageTemplate> => {
  const template = await MessageTemplate.findOne({
    where: { id, companyId }
  });

  if (!template) {
    throw new AppError("ERR_NO_MESSAGE_TEMPLATE_FOUND", 404);
  }

  await template.update(updateData);

  return template;
};

export default UpdateMessageTemplateService;
