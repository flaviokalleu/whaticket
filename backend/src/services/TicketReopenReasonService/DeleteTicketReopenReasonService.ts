import ShowTicketReopenReasonService from "./ShowTicketReopenReasonService";

interface Request {
  id: number | string;
  companyId: number;
}

const DeleteTicketReopenReasonService = async ({
  id,
  companyId
}: Request): Promise<void> => {
  const reopenReason = await ShowTicketReopenReasonService({ id, companyId });

  await reopenReason.destroy();
};

export default DeleteTicketReopenReasonService;
