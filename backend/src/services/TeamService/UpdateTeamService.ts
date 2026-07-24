import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Team from "../../models/Team";
import ShowTeamService from "./ShowTeamService";

interface TeamData {
  name?: string;
  departmentId?: number;
}

const UpdateTeamService = async (
  teamId: number | string,
  companyId: number,
  teamData: TeamData
): Promise<Team> => {
  const { name } = teamData;

  const teamSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_TEAM_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_TEAM_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const teamWithSameName = await Team.findOne({
              where: { name: value, companyId, id: { [Op.not]: teamId } }
            });

            return !teamWithSameName;
          }
          return true;
        }
      )
  });

  try {
    await teamSchema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const team = await ShowTeamService(teamId, companyId);

  await team.update(teamData);

  return team;
};

export default UpdateTeamService;
