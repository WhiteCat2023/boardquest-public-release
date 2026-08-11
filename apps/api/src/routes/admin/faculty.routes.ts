import { Router } from "express";
import {
  authenticateToken,
  requireRoles,
} from "../../middleware/auth.middleware";
import {
  getFaculties,
  createFaculty,
  toggleFacultyStatus,
  updateFacultyCategories,
  bulkCreateFaculty
} from "../../controller/admin/faculty.controller";

const router = Router();

// Only SUPERADMIN, ADMIN, and TEAMLEAD can list and create administrative accounts
router.get(
  "/",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  getFaculties,
);
router.post(
  "/",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  createFaculty,
);

router.post(
  "/bulk",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN"]),
  bulkCreateFaculty);

router.patch(
  "/:id/status",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  toggleFacultyStatus,
);
router.patch(
  "/:id/categories",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN"]),
  updateFacultyCategories,
);

export default router;
