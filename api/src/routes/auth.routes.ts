import { Router } from "express";
import { login, logout, signup, refreshToken} from "../controller/auth.controller";
import { me } from "../controller/user.controller";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/signup", authLimiter, signup);
router.get("/me", me);
router.get("/refresh", refreshToken);

export default router;