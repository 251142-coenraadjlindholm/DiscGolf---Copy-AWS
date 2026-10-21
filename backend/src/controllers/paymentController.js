import path from "node:path";
import fs from "node:fs/promises";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PAYMENT_STATUSES, PROOFS_DIR } from "../config/constants.js";
import { createMembershipId } from "../utils/membership.js";
import Upload from "../models/Upload.js";

// GET /api/admin/payments  (Live Payment Feed)
export const adminList = asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 }).limit(100).populate("user", "name");
  res.json({
    payments: payments
      .filter((p) => p.user)
      .map((p) => ({
        id: p._id,
        name: p.user.name,
        type: p.type, // "membership" | "event"
        status: p.status, // "pending" | "on_time" | "overdue"
        amount: p.amount,
        createdAt: p.createdAt,
      })),
  });
});

// PATCH /api/admin/payments/:id/status  { status }
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!PAYMENT_STATUSES.includes(status)) return res.status(400).json({ message: "Unknown status." });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Payment not found." });

  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment not found." });

  payment.status = status;
  await payment.save();

  // Assumption: a membership payment marked "on time" makes the person a DGSA member
  if (payment.type === "membership" && status === "on_time") {
    const user = await User.findById(payment.user);
    if (user) {
      user.tier = "dgsa";
      if (!user.dgsaMembershipId) user.dgsaMembershipId = await createMembershipId();
      await user.save();
    }
  }

  res.json({ id: payment._id, status: payment.status });
});

// GET /api/payments/:id/proof   (admin, or the person who paid)
export const proof = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Not found." });
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: "Not found." });

  const isOwner = payment.user.equals(req.user._id);
  if (req.user.role !== "admin" && !isOwner) return res.status(403).json({ message: "Not allowed." });

  // The file name comes from the database, never from the request.
  const proofPath = path.join(PROOFS_DIR, payment.proofFile);
  try {
    await fs.access(proofPath);
  } catch {
    const upload = await Upload.findOne({ filename: payment.proofFile, kind: "proof" }).select("contentType data");
    if (!upload) {
      return res.status(404).json({
        message: "This proof file is no longer available. Please upload the proof again.",
      });
    }
    res.type(upload.contentType).send(upload.data);
    return;
  }

  res.sendFile(proofPath, (err) => {
    if (err && !res.headersSent) res.status(404).json({ message: "Unable to send the proof file." });
  });
});