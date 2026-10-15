import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    homeAddress: String,
    country: String,
    province: String,
    city: String,
    suburb: String,
    zip: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },

    role: { type: String, enum: ["member", "admin"], default: "member" },
    tier: { type: String, enum: ["free", "dgsa"], default: "free" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Number generated and assigned when the account is created
    dgsaMembershipId: { type: Number, unique: true, sparse: true },

    // "Become a Member" step 1
    gender: String,
    dob: Date,
    saId: String,
    passport: String,
    mobile: String,
    usualDivision: String,

    // "Become a Member" step 2
    address: addressSchema,

    avatarUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);