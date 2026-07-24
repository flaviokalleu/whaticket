import ShowPersonalKanbanLaneService from "./ShowPersonalKanbanLaneService";

const DeletePersonalKanbanLaneService = async (
  laneId: number | string,
  userId: number,
  companyId: number
): Promise<void> => {
  const lane = await ShowPersonalKanbanLaneService(laneId, userId, companyId);

  await lane.destroy();
};

export default DeletePersonalKanbanLaneService;
