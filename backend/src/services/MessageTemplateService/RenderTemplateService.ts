import AppError from "../../errors/AppError";
import MessageTemplate from "../../models/MessageTemplate";

interface Request {
  templateId: string | number;
  companyId: number;
  variables: Record<string, string>;
}

const RenderTemplateService = async ({
  templateId,
  companyId,
  variables
}: Request): Promise<string> => {
  const template = await MessageTemplate.findOne({
    where: { id: templateId, companyId }
  });

  if (!template) {
    throw new AppError("ERR_NO_MESSAGE_TEMPLATE_FOUND", 404);
  }

  const rendered = template.body.replace(
    /{{\s*([\w.]+)\s*}}/g,
    (match, key: string) => {
      const value = variables?.[key];
      return value !== undefined ? value : match;
    }
  );

  return rendered;
};

export default RenderTemplateService;
