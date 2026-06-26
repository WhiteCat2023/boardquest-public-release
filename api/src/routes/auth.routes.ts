import { Router } from "express";
import { login, logout, signup, refreshToken} from "../controller/auth.controller";
import { me } from "../controller/user.controller";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/signup", signup);
router.get("/me", me);
router.get("/refresh", refreshToken);

export default router;