import * as Yup from "yup";
import AppError from "../../errors/AppError";
import TicketLane from "../../models/TicketLane";

interface LaneData {
  name: string;
  color: string;
  position?: number;
  companyId: number;
}

const CreateTicketLaneService = async (
  laneData: LaneData
): Promise<TicketLane> => {
  const { name, color, companyId } = laneData;

  const laneSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_TICKET_LANE_INVALID_NAME")
      .required("ERR_TICKET_LANE_INVALID_NAME"),
    color: Yup.string().required("ERR_TICKET_LANE_INVALID_COLOR")
  });

  try {
    await laneSchema.validate({ name, color });
  } catch (err) {
    throw new AppError(err.message);
  }

  let { position } = laneData;

  if (position === undefined) {
    const lastLane = await TicketLane.findOne({
      where: { companyId },
      order: [["position", "DESC"]]
    });
    position = lastLane ? lastLane.position + 1 : 0;
  }

  const lane = await TicketLane.create({ ...laneData, position });

  return lane;
};

export default CreateTicketLaneService;
