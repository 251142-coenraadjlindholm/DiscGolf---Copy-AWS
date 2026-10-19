import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { uploadProof } from "../middleware/upload.js";
import { lookupByEmail, submitMembership, purchaseMembership } from "../controllers/userController.js";

const router = Router();
router.use(authenticate);

router.get("/lookup", lookupByEmail);
router.post("/membership", uploadProof.single("proof"), submitMembership);
router.post("/membership/purchase", purchaseMembership);

export default router;