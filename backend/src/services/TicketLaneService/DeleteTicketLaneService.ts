import ShowTicketLaneService from "./ShowTicketLaneService";

const DeleteTicketLaneService = async (
  laneId: number | string,
  companyId: number
): Promise<void> => {
  const lane = await ShowTicketLaneService(laneId, companyId);

  await lane.destroy();
};

export default DeleteTicketLaneService;
