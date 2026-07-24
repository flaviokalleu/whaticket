import Lead from "../../models/Lead";

interface Response {
  total: number;
  byStatus: Record<string, number>;
}

const GetLeadStatsService = async (companyId: number): Promise<Response> => {
  const leads = await Lead.findAll({
    where: { companyId },
    attributes: ["status"],
    raw: true
  });

  const byStatus: Record<string, number> = {};

  leads.forEach(lead => {
    const { status } = lead as unknown as { status: string };
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  return {
    total: leads.length,
    byStatus
  };
};

export default GetLeadStatsService;
