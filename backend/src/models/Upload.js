import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true, index: true },
    kind: { type: String, enum: ["poster", "proof"], required: true, index: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Upload", uploadSchema);
