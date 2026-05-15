import { Router } from "express";
import { login, logout, signup } from "../controller/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/signup", signup);

export default router;