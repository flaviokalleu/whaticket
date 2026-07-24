import Department from "../../models/Department";
import Team from "../../models/Team";

const ListDepartmentsService = async (
  companyId: number
): Promise<Department[]> => {
  const departments = await Department.findAll({
    where: { companyId },
    include: [{ model: Team, as: "teams" }],
    order: [["name", "ASC"]]
  });

  return departments;
};

export default ListDepartmentsService;
