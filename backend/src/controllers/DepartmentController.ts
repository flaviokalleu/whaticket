import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateDepartmentService from "../services/DepartmentService/CreateDepartmentService";
import DeleteDepartmentService from "../services/DepartmentService/DeleteDepartmentService";
import ListDepartmentsService from "../services/DepartmentService/ListDepartmentsService";
import ShowDepartmentService from "../services/DepartmentService/ShowDepartmentService";
import UpdateDepartmentService from "../services/DepartmentService/UpdateDepartmentService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const departments = await ListDepartmentsService(companyId);

  return res.status(200).json(departments);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name } = req.body;

  const department = await CreateDepartmentService({ name, companyId });

  const io = getIO();
  io.emit("department", {
    action: "update",
    department
  });

  return res.status(200).json(department);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { departmentId } = req.params;

  const department = await ShowDepartmentService(departmentId, companyId);

  return res.status(200).json(department);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { departmentId } = req.params;

  const department = await UpdateDepartmentService(
    departmentId,
    companyId,
    req.body
  );

  const io = getIO();
  io.emit("department", {
    action: "update",
    department
  });

  return res.status(201).json(department);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { departmentId } = req.params;

  await DeleteDepartmentService(departmentId, companyId);

  const io = getIO();
  io.emit("department", {
    action: "delete",
    departmentId: +departmentId
  });

  return res.status(200).send();
};
