import LeadTask from "../../models/LeadTask";
import ShowLeadTaskService from "./ShowLeadTaskService";

interface Request {
  title?: string;
  dueDate?: Date | string;
  userId?: number;
  isCompleted?: boolean;
}

const UpdateLeadTaskService = async (
  taskId: number | string,
  companyId: number,
  taskData: Request
): Promise<LeadTask> => {
  const task = await ShowLeadTaskService(taskId, companyId);

  await task.update(taskData);

  return task;
};

export default UpdateLeadTaskService;
