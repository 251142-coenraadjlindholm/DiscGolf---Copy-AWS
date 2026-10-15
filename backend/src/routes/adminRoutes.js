import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { adminList as payments, updateStatus } from "../controllers/paymentController.js";
import { listMembers } from "../controllers/userController.js";
import { adminList as registrations } from "../controllers/registrationController.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/payments", payments);
router.patch("/payments/:id/status", updateStatus);
router.get("/members", listMembers);
router.get("/registrations", registrations);

export default router;