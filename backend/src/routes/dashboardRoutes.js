import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { member } from "../controllers/dashboardController.js";

const router = Router();
router.get("/member", authenticate, member);

export default router;