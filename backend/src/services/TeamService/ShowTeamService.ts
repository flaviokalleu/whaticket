import AppError from "../../errors/AppError";
import Team from "../../models/Team";
import User from "../../models/User";
import Department from "../../models/Department";

const ShowTeamService = async (
  teamId: number | string,
  companyId: number
): Promise<Team> => {
  const team = await Team.findOne({
    where: { id: teamId, companyId },
    include: [
      { model: User, as: "users", attributes: ["id", "name", "email"] },
      { model: Department, as: "department" }
    ]
  });

  if (!team) {
    throw new AppError("ERR_TEAM_NOT_FOUND");
  }

  return team;
};

export default ShowTeamService;
