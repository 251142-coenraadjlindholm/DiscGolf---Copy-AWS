import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // the player
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who filled the form
    division: String,
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
  },
  { timestamps: true }
);

// A player can only be registered once per event
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);