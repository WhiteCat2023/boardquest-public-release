import { Router } from "express";
import { authenticateToken, requireRoles } from "../../middleware/auth.middleware";
import {
  getReviewCenters,
  getReviewCenterById,
  createReviewCenter,
  updateReviewCenter,
  deleteReviewCenter,
} from "../../controller/admin/reviewCenter.controller";

const router = Router();

// Routes accessible by SUPERADMIN, ADMIN, and TEAMLEAD
router.get("/", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), getReviewCenters);
router.get("/:id", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), getReviewCenterById);
router.post("/", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), createReviewCenter);
router.put("/:id", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), updateReviewCenter);
router.delete("/:id", authenticateToken, requireRoles(["SUPERADMIN", "ADMIN", "TEAMLEAD"]), deleteReviewCenter);

export default router;
