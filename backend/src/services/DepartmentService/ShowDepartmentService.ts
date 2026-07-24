import AppError from "../../errors/AppError";
import Department from "../../models/Department";
import Team from "../../models/Team";

const ShowDepartmentService = async (
  departmentId: number | string,
  companyId: number
): Promise<Department> => {
  const department = await Department.findOne({
    where: { id: departmentId, companyId },
    include: [{ model: Team, as: "teams" }]
  });

  if (!department) {
    throw new AppError("ERR_DEPARTMENT_NOT_FOUND");
  }

  return department;
};

export default ShowDepartmentService;
