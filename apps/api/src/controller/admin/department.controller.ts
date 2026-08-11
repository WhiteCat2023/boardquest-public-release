import { asyncHandler } from "../../utils/asyncHandler";
import * as departmentService from "../../services/admin/department.service";
import { ApiResponse } from "../../utils/apiResponse";
import { Request, Response } from "express";

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentService.createNewDepartment(req.body);
  return new ApiResponse(201, { department }, "Department created successfully").send(res);
});

export const getDepartments = asyncHandler(async (req: Request, res: Response) => {
  const departments = await departmentService.getAllDepartments();
  return new ApiResponse(200, { departments }, "Departments retrieved successfully").send(res);
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const updatedDepartment = await departmentService.updateDepartment(req.body);
  return new ApiResponse(200, { department: updatedDepartment }, "Department updated successfully").send(res);
});

export const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId } = req.params;
  await departmentService.deleteDepartment(departmentId as string);
  return new ApiResponse(200, null, "Department deleted successfully").send(res);
});