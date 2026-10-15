import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { uploadPoster, uploadProof } from "../middleware/upload.js";
import { list, getOne, create } from "../controllers/eventController.js";
import { create as register } from "../controllers/registrationController.js";

const router = Router();
router.use(authenticate);

router.get("/", list);
router.get("/:id", getOne);
router.post("/", requireAdmin, uploadPoster.single("poster"), create);
router.post("/:eventId/registrations", uploadProof.single("proof"), register);

export default router;