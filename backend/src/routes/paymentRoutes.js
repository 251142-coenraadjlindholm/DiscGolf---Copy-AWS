import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { proof } from "../controllers/paymentController.js";

const router = Router();
router.get("/:id/proof", authenticate, proof);

export default router;