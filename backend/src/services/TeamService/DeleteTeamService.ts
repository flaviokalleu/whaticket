import ShowTeamService from "./ShowTeamService";

const DeleteTeamService = async (
  teamId: number | string,
  companyId: number
): Promise<void> => {
  const team = await ShowTeamService(teamId, companyId);

  await team.destroy();
};

export default DeleteTeamService;
