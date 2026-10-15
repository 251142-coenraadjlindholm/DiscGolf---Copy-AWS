import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    posterUrl: { type: String, required: true }, // e.g. /uploads/posters/abc123.jpg
    pdgaTier: { type: String, required: true },

    startsAt: { type: Date, required: true, index: true },
    endsAt: Date, // optional

    priceNonMember: { type: Number, required: true, min: 0 },
    priceMember: { type: Number, required: true, min: 0 },
    bankDetails: { type: String, required: true, maxlength: 1000 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);