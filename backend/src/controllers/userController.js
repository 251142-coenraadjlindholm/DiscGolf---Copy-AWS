import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { reject } from "../utils/respond.js";
import { asString, isEmail, hasDigits, isZip } from "../utils/validators.js";
import { DIVISIONS, MEMBERSHIP_FEE } from "../config/constants.js";

// GET /api/users/lookup?email=   (logged-in users registering other players)
export const lookupByEmail = asyncHandler(async (req, res) => {
  const email = asString(req.query.email).toLowerCase();
  if (!isEmail(email)) return res.status(400).json({ message: "Enter a valid email address." });

  const user = await User.findOne({ email }).select("tier dgsaMembershipId");
  res.json({
    exists: Boolean(user),
    tier: user?.tier ?? null,
    membershipId: user?.dgsaMembershipId ?? null,
  });
});

// POST /api/users/membership   multipart: details + address fields + proof file
export const submitMembership = asyncHandler(async (req, res) => {
  const b = req.body;
  const s = (v) => asString(v).slice(0, 200);
  const bad = (field, message) => reject(req, res, 400, { field, message });

  const gender = s(b.gender);
  const dob = s(b.dob);
  const mobile = s(b.mobile);
  const saId = s(b.saId);
  const passport = s(b.passport);
  const usualDivision = s(b.usualDivision);
  const address = {
    homeAddress: s(b.homeAddress),
    country: s(b.country),
    province: s(b.province),
    city: s(b.city),
    suburb: s(b.suburb),
    zip: s(b.zip),
  };

  const dobDate = new Date(dob);
  if (!gender) return bad("gender", "Select your gender.");
  if (!dob || Number.isNaN(dobDate.getTime()) || dobDate > new Date())
    return bad("dob", "Enter a valid date of birth.");
  if (!mobile) return bad("mobile", "Enter your mobile number.");
  if (usualDivision && !DIVISIONS.includes(usualDivision)) return bad("division", "Unknown division.");

  if (!address.homeAddress) return bad("homeAddress", "Enter your home address.");
  for (const f of ["country", "province", "city", "suburb"]) {
    if (!address[f] || hasDigits(address[f])) return bad(f, `Enter your ${f} (no numbers).`);
  }
  if (!isZip(address.zip)) return bad("zip", "Enter a 4-digit ZIP code.");
  if (!req.file) return bad("proof", "Upload your proof of payment.");

  if (req.user.tier === "dgsa")
    return reject(req, res, 409, { message: "You are already a DGSA member." });
  if (await Payment.exists({ user: req.user._id, type: "membership", status: "pending" }))
    return reject(req, res, 409, { message: "You already have a membership payment waiting to be checked." });

  Object.assign(req.user, { gender, dob: dobDate, saId, passport, mobile, usualDivision, address });
  await req.user.save();

  await Payment.create({
    user: req.user._id,
    type: "membership",
    amount: MEMBERSHIP_FEE,
    proofFile: req.file.filename,
  });

  res.status(201).json({ message: "Membership submitted. We'll check your payment." });
});

// GET /api/admin/members
export const listMembers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "member" }).sort({ name: 1 }).limit(500).select("name tier mobile status");
  res.json({
    members: users.map((u) => ({
      id: u._id,
      name: u.name,
      tier: u.tier,
      contact: u.mobile || null,
      status: u.status,
    })),
  });
});