import { Router } from "express";
import v1Router from "./v1/index.js";

const router = Router();

// Root route router mounts v1 endpoints
router.use("/", v1Router);

export { v1Router };
export default router;