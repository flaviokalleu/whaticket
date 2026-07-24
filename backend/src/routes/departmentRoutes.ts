import { Router } from "express";
import isAuth from "../middleware/isAuth";

import * as DepartmentController from "../controllers/DepartmentController";

const departmentRoutes = Router();

departmentRoutes.get("/departments", isAuth, DepartmentController.index);

departmentRoutes.post("/departments", isAuth, DepartmentController.store);

departmentRoutes.get(
  "/departments/:departmentId",
  isAuth,
  DepartmentController.show
);

departmentRoutes.put(
  "/departments/:departmentId",
  isAuth,
  DepartmentController.update
);

departmentRoutes.delete(
  "/departments/:departmentId",
  isAuth,
  DepartmentController.remove
);

export default departmentRoutes;
