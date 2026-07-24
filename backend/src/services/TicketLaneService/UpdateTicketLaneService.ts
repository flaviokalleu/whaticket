import * as Yup from "yup";
import AppError from "../../errors/AppError";
import TicketLane from "../../models/TicketLane";
import ShowTicketLaneService from "./ShowTicketLaneService";

interface LaneData {
  name?: string;
  color?: string;
  position?: number;
}

const UpdateTicketLaneService = async (
  laneId: number | string,
  companyId: number,
  laneData: LaneData
): Promise<TicketLane> => {
  const { name, color } = laneData;

  const laneSchema = Yup.object().shape({
    name: Yup.string().min(2, "ERR_TICKET_LANE_INVALID_NAME"),
    color: Yup.string()
  });

  try {
    await laneSchema.validate({ name, color });
  } catch (err) {
    throw new AppError(err.message);
  }

  const lane = await ShowTicketLaneService(laneId, companyId);

  await lane.update(laneData);

  return lane;
};

export default UpdateTicketLaneService;
