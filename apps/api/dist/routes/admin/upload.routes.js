import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.middleware";
import { uploadBadgeImage, uploadModuleFile } from "../../controller/admin/upload.controller";
const router = Router();
router.post("/badge-image", authenticateToken, uploadBadgeImage);
router.post("/module-file", authenticateToken, uploadModuleFile);
router.post("/file", authenticateToken, uploadModuleFile);
router.post("/", authenticateToken, uploadBadgeImage);
export default router;
