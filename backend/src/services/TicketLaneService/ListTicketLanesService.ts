import TicketLane from "../../models/TicketLane";

const ListTicketLanesService = async (
  companyId: number
): Promise<TicketLane[]> => {
  const lanes = await TicketLane.findAll({
    where: { companyId },
    order: [["position", "ASC"]]
  });

  return lanes;
};

export default ListTicketLanesService;
