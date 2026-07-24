import * as Yup from "yup";
import AppError from "../../errors/AppError";
import MessageTemplate from "../../models/MessageTemplate";

interface Request {
  name: string;
  body: string;
  companyId: number;
}

const CreateMessageTemplateService = async (
  data: Request
): Promise<MessageTemplate> => {
  const schema = Yup.object().shape({
    name: Yup.string().required("ERR_MESSAGE_TEMPLATE_INVALID_NAME"),
    body: Yup.string().required("ERR_MESSAGE_TEMPLATE_INVALID_BODY")
  });

  try {
    await schema.validate(data);
  } catch (err) {
    throw new AppError(err.message);
  }

  const template = await MessageTemplate.create(data);

  return template;
};

export default CreateMessageTemplateService;
