import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Department from "../../models/Department";

interface DepartmentData {
  name: string;
  companyId: number;
}

const CreateDepartmentService = async (
  departmentData: DepartmentData
): Promise<Department> => {
  const { name, companyId } = departmentData;

  const departmentSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_DEPARTMENT_INVALID_NAME")
      .required("ERR_DEPARTMENT_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_DEPARTMENT_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const departmentWithSameName = await Department.findOne({
              where: { name: value, companyId }
            });

            return !departmentWithSameName;
          }
          return false;
        }
      )
  });

  try {
    await departmentSchema.validate({ name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const department = await Department.create(departmentData);

  return department;
};

export default CreateDepartmentService;
