import * as Yup from "yup";
import AppError from "../../errors/AppError";
import LeadTask from "../../models/LeadTask";
import ShowLeadService from "./ShowLeadService";

interface Request {
  leadId: number | string;
  userId?: number;
  companyId: number;
  title: string;
  dueDate?: Date | string;
}

const CreateLeadTaskService = async ({
  leadId,
  userId,
  companyId,
  title,
  dueDate
}: Request): Promise<LeadTask> => {
  const schema = Yup.object().shape({
    title: Yup.string()
      .min(2, "ERR_LEAD_TASK_INVALID_TITLE")
      .required("ERR_LEAD_TASK_INVALID_TITLE")
  });

  try {
    await schema.validate({ title });
  } catch (err) {
    throw new AppError(err.message);
  }

  // Ensures the lead belongs to the requesting company
  await ShowLeadService(leadId, companyId);

  const task = await LeadTask.create({
    leadId,
    userId,
    companyId,
    title,
    dueDate
  });

  return task;
};

export default CreateLeadTaskService;
