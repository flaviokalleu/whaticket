import PersonalKanbanLane from "../../models/PersonalKanbanLane";
import PersonalKanbanItem from "../../models/PersonalKanbanItem";

const ListPersonalKanbanLanesService = async (
  userId: number,
  companyId: number
): Promise<PersonalKanbanLane[]> => {
  const lanes = await PersonalKanbanLane.findAll({
    where: { userId, companyId },
    order: [["position", "ASC"]],
    include: [{ model: PersonalKanbanItem, as: "items" }]
  });

  return lanes;
};

export default ListPersonalKanbanLanesService;
