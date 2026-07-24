import AppError from "../../errors/AppError";
import TicketLane from "../../models/TicketLane";

const ShowTicketLaneService = async (
  laneId: number | string,
  companyId: number
): Promise<TicketLane> => {
  const lane = await TicketLane.findOne({ where: { id: laneId, companyId } });

  if (!lane) {
    throw new AppError("ERR_TICKET_LANE_NOT_FOUND", 404);
  }

  return lane;
};

export default ShowTicketLaneService;
