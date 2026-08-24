import { Router } from "express";
import { authenticateToken, requireRoles, } from "../../middleware/auth.middleware";
import { getFaculties, createFaculty, toggleFacultyStatus, updateFacultyCategories, bulkCreateFaculty } from "../../controller/admin/user.controller";
const router = Router();
// Only SUPERADMIN, DEAN, and TEAMLEAD can list and create administrative accounts
router.get("/", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), getFaculties);
router.post("/", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), createFaculty);
router.post("/bulk", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), bulkCreateFaculty);
router.patch("/:id/status", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), toggleFacultyStatus);
router.patch("/:id/categories", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), updateFacultyCategories);
export default router;
