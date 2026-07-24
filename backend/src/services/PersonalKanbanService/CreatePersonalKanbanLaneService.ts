import * as Yup from "yup";
import AppError from "../../errors/AppError";
import PersonalKanbanLane from "../../models/PersonalKanbanLane";

interface LaneData {
  name: string;
  position?: number;
  userId: number;
  companyId: number;
}

const CreatePersonalKanbanLaneService = async (
  laneData: LaneData
): Promise<PersonalKanbanLane> => {
  const { name, userId, companyId } = laneData;

  const laneSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_PERSONAL_KANBAN_LANE_INVALID_NAME")
      .required("ERR_PERSONAL_KANBAN_LANE_INVALID_NAME")
  });

  try {
    await laneSchema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  let { position } = laneData;

  if (position === undefined) {
    const lastLane = await PersonalKanbanLane.findOne({
      where: { userId, companyId },
      order: [["position", "DESC"]]
    });
    position = lastLane ? lastLane.position + 1 : 0;
  }

  const lane = await PersonalKanbanLane.create({ ...laneData, position });

  return lane;
};

export default CreatePersonalKanbanLaneService;
