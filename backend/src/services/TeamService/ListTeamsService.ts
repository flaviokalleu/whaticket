import Team from "../../models/Team";
import User from "../../models/User";
import Department from "../../models/Department";

const ListTeamsService = async (companyId: number): Promise<Team[]> => {
  const teams = await Team.findAll({
    where: { companyId },
    include: [
      { model: User, as: "users", attributes: ["id", "name", "email"] },
      { model: Department, as: "department" }
    ],
    order: [["name", "ASC"]]
  });

  return teams;
};

export default ListTeamsService;
