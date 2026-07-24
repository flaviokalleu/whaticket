import AppError from "../../errors/AppError";
import TeamUser from "../../models/TeamUser";
import User from "../../models/User";
import ShowTeamService from "./ShowTeamService";

const AddTeamMemberService = async (
  teamId: number | string,
  userId: number | string,
  companyId: number
): Promise<TeamUser> => {
  const team = await ShowTeamService(teamId, companyId);

  const user = await User.findOne({ where: { id: userId, companyId } });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const existing = await TeamUser.findOne({
    where: { teamId: team.id, userId: user.id }
  });

  if (existing) {
    return existing;
  }

  const teamUser = await TeamUser.create({ teamId: team.id, userId: user.id });

  return teamUser;
};

export default AddTeamMemberService;
