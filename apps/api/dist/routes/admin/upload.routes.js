import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { uploadBadgeImage } from "../../controller/admin/upload.controller";
const router = Router();
router.post("/badge-image", authenticateToken, uploadBadgeImage);
router.post("/", authenticateToken, uploadBadgeImage);
export default router;
