import { Router } from "express";
import { authenticateToken, requireRoles, } from "../../middleware/auth.middleware";
import { getUsers, createUser, toggleUserStatus, updateUserCategories, bulkCreateUsers, getActiveDean, } from "../../controller/admin/user.controller";
const router = Router();
// Only SUPERADMIN, DEAN, and TEAMLEAD can list and create administrative accounts
router.get("/active-dean", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), getActiveDean);
router.get("/", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), getUsers);
router.post("/", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), createUser);
router.post("/bulk", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), bulkCreateUsers);
router.patch("/:id/status", authenticateToken, requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]), toggleUserStatus);
router.patch("/:id/categories", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), updateUserCategories);
router.patch("/:id/subjects", authenticateToken, requireRoles(["SUPERADMIN", "DEAN"]), updateUserCategories);
export default router;
