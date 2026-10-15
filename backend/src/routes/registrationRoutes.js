import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { mine } from "../controllers/registrationController.js";

const router = Router();
router.get("/mine", authenticate, mine);

export default router;