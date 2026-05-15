import { Router } from "express";
import { authenticateToken, requireAdmin } from "../../middleware/auth.middleware";
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from "../../controller/admin/department.controller";

const router = Router();

router.post("/create", authenticateToken, requireAdmin, createDepartment);
router.get("/get", authenticateToken, requireAdmin, getDepartments);
router.put("/:departmentId", authenticateToken, requireAdmin, updateDepartment);
router.delete("/:departmentId", authenticateToken, requireAdmin, deleteDepartment);

export default router;