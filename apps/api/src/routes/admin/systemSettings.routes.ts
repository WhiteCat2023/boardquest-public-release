import { Router } from "express";
import { authenticateToken, requireAdmin } from "../../middleware/auth.middleware";
import {
  getSystemSettingsController,
  updateSystemSettingsController,
  resetSystemSettingsController,
} from "../../controller/admin/systemSettings.controller";

const router = Router();

// GET settings is open so portals (including login and unauthenticated views) can display institutional branding
router.get("/", getSystemSettingsController);

// Mutation endpoints strictly restricted to SUPERADMIN and DEAN
router.put("/", authenticateToken, requireAdmin, updateSystemSettingsController);
router.post("/reset", authenticateToken, requireAdmin, resetSystemSettingsController);

export default router;
