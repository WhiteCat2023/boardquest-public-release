import { z } from "zod";
// ============ Validation Schemas ============
export const createNewDepartmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    authorId: z.string().min(1, "Author ID is required"),
});
export const updateDepartmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    departmentId: z.string().min(1, "Department ID is required"),
});
// ============ Department Services (Legacy Stubs) ============
export async function createNewDepartment(data) {
    return { id: "dept-stub", name: data.name, authorId: data.authorId };
}
export async function getAllDepartments() {
    return [];
}
export async function getDepartmentById(departmentId) {
    return { id: departmentId, name: "General Department", members: [] };
}
export async function updateDepartment(data) {
    return { id: data.departmentId, name: data.name };
}
export async function deleteDepartment(departmentId) {
    return { id: departmentId };
}
export class DepartmentService {
    createNewDepartment = createNewDepartment;
    getAllDepartments = getAllDepartments;
    getDepartmentById = getDepartmentById;
    updateDepartment = updateDepartment;
    deleteDepartment = deleteDepartment;
}
