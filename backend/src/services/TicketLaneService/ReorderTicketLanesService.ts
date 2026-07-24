import AppError from "../../errors/AppError";
import TicketLane from "../../models/TicketLane";

interface LaneOrder {
  id: number;
  position: number;
}

const ReorderTicketLanesService = async (
  companyId: number,
  lanes: LaneOrder[]
): Promise<TicketLane[]> => {
  if (!Array.isArray(lanes)) {
    throw new AppError("ERR_TICKET_LANE_INVALID_ORDER");
  }

  await Promise.all(
    lanes.map(async ({ id, position }) => {
      const [affected] = await TicketLane.update(
        { position },
        { where: { id, companyId } }
      );
      if (!affected) {
        throw new AppError("ERR_TICKET_LANE_NOT_FOUND", 404);
      }
    })
  );

  const updatedLanes = await TicketLane.findAll({
    where: { companyId },
    order: [["position", "ASC"]]
  });

  return updatedLanes;
};

export default ReorderTicketLanesService;
