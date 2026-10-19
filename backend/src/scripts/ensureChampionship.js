import "dotenv/config";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import User from "../models/User.js";

await mongoose.connect(process.env.MONGODB_URI);

try {
  const admin = await User.findOne({ role: "admin" }).select("_id");
  if (!admin) throw new Error("No admin user found.");

  const event = await Event.findOneAndUpdate(
    { name: "1st African Disc Golf Championship" },
    {
      $set: {
        location: "Inanda Country Base, Kyalami",
        description: "The inaugural PDGA African Disc Golf Championship hosted by Disc Golf South Africa.",
        posterUrl: "/uploads/posters/seed-placeholder.jpg",
        pdgaTier: "C-Tier",
        startsAt: new Date("2026-11-06T05:00:00.000Z"),
        endsAt: new Date("2026-11-08T15:00:00.000Z"),
        priceNonMember: 300,
        priceMember: 250,
        bankDetails: "DGSA demo payment details",
        createdBy: admin._id,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Ensured championship event ${event._id}.`);
} finally {
  await mongoose.disconnect();
}
