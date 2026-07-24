import LeadTask from "../../models/LeadTask";
import ShowLeadTaskService from "./ShowLeadTaskService";

const CompleteLeadTaskService = async (
  taskId: number | string,
  companyId: number
): Promise<LeadTask> => {
  const task = await ShowLeadTaskService(taskId, companyId);

  await task.update({ isCompleted: true });

  return task;
};

export default CompleteLeadTaskService;
