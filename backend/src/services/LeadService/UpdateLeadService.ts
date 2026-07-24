import Lead from "../../models/Lead";
import ShowLeadService from "./ShowLeadService";

interface Request {
  name?: string;
  phone?: string;
  email?: string;
  source?: string;
  status?: string;
  userId?: number;
  leadPipelineId?: number;
}

const UpdateLeadService = async (
  leadId: number | string,
  companyId: number,
  leadData: Request
): Promise<Lead> => {
  const lead = await ShowLeadService(leadId, companyId);

  await lead.update(leadData);

  return ShowLeadService(leadId, companyId);
};

export default UpdateLeadService;
