import AppError from "../../errors/AppError";
import TeamUser from "../../models/TeamUser";
import ShowTeamService from "./ShowTeamService";

const RemoveTeamMemberService = async (
  teamId: number | string,
  userId: number | string,
  companyId: number
): Promise<void> => {
  const team = await ShowTeamService(teamId, companyId);

  const teamUser = await TeamUser.findOne({
    where: { teamId: team.id, userId }
  });

  if (!teamUser) {
    throw new AppError("ERR_TEAM_MEMBER_NOT_FOUND", 404);
  }

  await teamUser.destroy();
};

export default RemoveTeamMemberService;
