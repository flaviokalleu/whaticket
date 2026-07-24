import AppError from "../../errors/AppError";
import Lead from "../../models/Lead";
import LeadPipeline from "../../models/LeadPipeline";
import User from "../../models/User";
import LeadInteraction from "../../models/LeadInteraction";
import LeadTask from "../../models/LeadTask";

const ShowLeadService = async (
  leadId: number | string,
  companyId: number
): Promise<Lead> => {
  const lead = await Lead.findOne({
    where: { id: leadId, companyId },
    include: [
      { model: LeadPipeline, as: "leadPipeline" },
      { model: User, as: "user", attributes: ["id", "name"] },
      { model: LeadInteraction, as: "interactions" },
      { model: LeadTask, as: "tasks" }
    ]
  });

  if (!lead) {
    throw new AppError("ERR_LEAD_NOT_FOUND", 404);
  }

  return lead;
};

export default ShowLeadService;
