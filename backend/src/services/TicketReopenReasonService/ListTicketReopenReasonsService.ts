import TicketReopenReason from "../../models/TicketReopenReason";

interface Request {
  companyId: number;
}

const ListTicketReopenReasonsService = async ({
  companyId
}: Request): Promise<TicketReopenReason[]> => {
  const reopenReasons = await TicketReopenReason.findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  return reopenReasons;
};

export default ListTicketReopenReasonsService;
