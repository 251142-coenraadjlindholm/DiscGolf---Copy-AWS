import mongoose from "mongoose";
import { PAYMENT_STATUSES } from "../config/constants.js";

// One payment = one proof of payment upload.
// A multi-player tournament registration is paid with a single Payment.
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // the payer
    type: { type: String, enum: ["membership", "event"], required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // only for type "event"
    amount: { type: Number, required: true, min: 0 },
    proofFile: { type: String, required: true }, // file name inside uploads/proofs
    status: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);