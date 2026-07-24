import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Team from "../../models/Team";

interface TeamData {
  name: string;
  companyId: number;
  departmentId?: number;
}

const CreateTeamService = async (teamData: TeamData): Promise<Team> => {
  const { name, companyId } = teamData;

  const teamSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_TEAM_INVALID_NAME")
      .required("ERR_TEAM_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_TEAM_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const teamWithSameName = await Team.findOne({
              where: { name: value, companyId }
            });

            return !teamWithSameName;
          }
          return false;
        }
      )
  });

  try {
    await teamSchema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const team = await Team.create(teamData);

  return team;
};

export default CreateTeamService;
