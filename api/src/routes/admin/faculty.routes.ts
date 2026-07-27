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
  updateFacultyPermissions,
  createPermissionRequest,
  getPermissionRequests,
  reviewPermissionRequest,
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

// Permission Requests Endpoints
router.post(
  "/permission-requests",
  authenticateToken,
  createPermissionRequest,
);
router.get(
  "/permission-requests",
  authenticateToken,
  getPermissionRequests,
);
router.put(
  "/permission-requests/:id/review",
  authenticateToken,
  reviewPermissionRequest,
);

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
router.put(
  "/:id/permissions",
  authenticateToken,
  requireRoles(["SUPERADMIN", "ADMIN"]),
  updateFacultyPermissions,
);

export default router;
