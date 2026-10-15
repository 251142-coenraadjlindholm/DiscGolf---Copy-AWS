import { Router } from "express";
import rateLimit from "express-rate-limit";
import { signup, login, logout, me } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Slows down password guessing and account probing
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

router.post("/signup", limiter, signup);
router.post("/login", limiter, login);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export default router;