import ShowLeadService from "./ShowLeadService";

const DeleteLeadService = async (
  leadId: number | string,
  companyId: number
): Promise<void> => {
  const lead = await ShowLeadService(leadId, companyId);

  await lead.destroy();
};

export default DeleteLeadService;
