import LeadTask from "../../models/LeadTask";
import User from "../../models/User";

const ListLeadTasksService = async (
  leadId: number | string,
  companyId: number
): Promise<LeadTask[]> => {
  const tasks = await LeadTask.findAll({
    where: { leadId, companyId },
    include: [{ model: User, as: "user", attributes: ["id", "name"] }],
    order: [["dueDate", "ASC"]]
  });

  return tasks;
};

export default ListLeadTasksService;
