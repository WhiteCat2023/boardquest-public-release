import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import { getFaculties, createFaculty, deleteFaculty, toggleFacultyStatus } from "../../controller/admin/faculty.controller";

const router = Router();

// Only SUPERADMIN, ADMIN, and TEAMLEAD can list and create administrative accounts
router.get("/", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), getFaculties);
router.post("/", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), createFaculty);
router.patch("/:id/status", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), toggleFacultyStatus);
router.delete("/:id", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), deleteFaculty);

export default router;
