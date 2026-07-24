import AppError from "../../errors/AppError";
import LeadTask from "../../models/LeadTask";

const ShowLeadTaskService = async (
  taskId: number | string,
  companyId: number
): Promise<LeadTask> => {
  const task = await LeadTask.findOne({
    where: { id: taskId, companyId }
  });

  if (!task) {
    throw new AppError("ERR_LEAD_TASK_NOT_FOUND", 404);
  }

  return task;
};

export default ShowLeadTaskService;
