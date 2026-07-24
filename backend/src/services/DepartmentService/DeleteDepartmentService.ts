import ShowDepartmentService from "./ShowDepartmentService";

const DeleteDepartmentService = async (
  departmentId: number | string,
  companyId: number
): Promise<void> => {
  const department = await ShowDepartmentService(departmentId, companyId);

  await department.destroy();
};

export default DeleteDepartmentService;
