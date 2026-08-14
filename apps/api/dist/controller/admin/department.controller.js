import { asyncHandler } from "../../utils/asyncHandler";
import * as departmentService from "../../services/admin/department.service";
import { ApiResponse } from "../../utils/apiResponse";
export const createDepartment = asyncHandler(async (req, res) => {
    const department = await departmentService.createNewDepartment(req.body);
    return new ApiResponse(201, { department }, "Department created successfully").send(res);
});
export const getDepartments = asyncHandler(async (req, res) => {
    const departments = await departmentService.getAllDepartments();
    return new ApiResponse(200, { departments }, "Departments retrieved successfully").send(res);
});
export const updateDepartment = asyncHandler(async (req, res) => {
    const updatedDepartment = await departmentService.updateDepartment(req.body);
    return new ApiResponse(200, { department: updatedDepartment }, "Department updated successfully").send(res);
});
export const deleteDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.params;
    await departmentService.deleteDepartment(departmentId);
    return new ApiResponse(200, null, "Department deleted successfully").send(res);
});
