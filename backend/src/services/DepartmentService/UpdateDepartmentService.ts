import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Department from "../../models/Department";
import ShowDepartmentService from "./ShowDepartmentService";

interface DepartmentData {
  name?: string;
}

const UpdateDepartmentService = async (
  departmentId: number | string,
  companyId: number,
  departmentData: DepartmentData
): Promise<Department> => {
  const { name } = departmentData;

  const departmentSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_DEPARTMENT_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_DEPARTMENT_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const departmentWithSameName = await Department.findOne({
              where: { name: value, companyId, id: { [Op.not]: departmentId } }
            });

            return !departmentWithSameName;
          }
          return true;
        }
      )
  });

  try {
    await departmentSchema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const department = await ShowDepartmentService(departmentId, companyId);

  await department.update(departmentData);

  return department;
};

export default UpdateDepartmentService;
