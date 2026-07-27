import { Router } from "express";
import {
  authenticateToken,
  requireRoles,
} from "../../middleware/auth.middleware";
import {
  createGuidanceAssignment,
  getGuidanceAssignments,
  updateGuidanceAssignment,
  getFailingStudents,
} from "../../controller/admin/guidance.controller";

const router = Router();

router.use(authenticateToken);

router.post(
  "/",
  requireRoles(["SUPERADMIN", "ADMIN"]),
  createGuidanceAssignment
);

router.get(
  "/",
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD", "TEACHER"]),
  getGuidanceAssignments
);

router.put(
  "/:id",
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD", "TEACHER"]),
  updateGuidanceAssignment
);

router.get(
  "/failing-students",
  requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]),
  getFailingStudents
);

export default router;
