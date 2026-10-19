import mongoose from "mongoose";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { reject } from "../utils/respond.js";
import { asString, isEmail } from "../utils/validators.js";
import { DIVISIONS, MAX_REGISTRANTS } from "../config/constants.js";

// POST /api/events/:eventId/registrations
// multipart: proof (file) + registrants (JSON string: [{ email, membershipId?, division? }])
export const create = asyncHandler(async (req, res) => {
  const bad = (status, field, message) => reject(req, res, status, { field, message });

  if (!mongoose.isValidObjectId(req.params.eventId)) return bad(404, null, "Event not found.");
  const event = await Event.findById(req.params.eventId);
  if (!event) return bad(404, null, "Event not found.");
  if (!req.file) return bad(400, "proof", "Upload your proof of payment.");

  let list;
  try {
    list = JSON.parse(req.body.registrants);
  } catch {
    return bad(400, null, "Registrants are missing or invalid.");
  }
  if (!Array.isArray(list) || list.length < 1 || list.length > MAX_REGISTRANTS)
    return bad(400, null, `Register between 1 and ${MAX_REGISTRANTS} players.`);

  const seen = new Set();
  const players = [];
  let amount = 0;

  for (const r of list) {
    const email = asString(r?.email).toLowerCase();
    const division = asString(r?.division);
    const membershipId = asString(r?.membershipId);

    if (!isEmail(email)) return bad(400, "email", "Enter a valid email address for every player.");
    if (seen.has(email)) return bad(400, "email", `${email} is in the list twice.`);
    seen.add(email);
    if (division && !DIVISIONS.includes(division)) return bad(400, "division", "Unknown division.");

    const user = await User.findOne({ email });
    if (!user) return bad(404, "email", `Email not found. ${email} must create an account.`);

    // Every player must provide the six-digit ID issued to their account.
    if (!/^\d{6}$/.test(membershipId) || Number(membershipId) !== user.dgsaMembershipId)
      return bad(400, "membershipId", `The DGSA membership ID doesn't match ${email}.`);

    if (await Registration.exists({ event: event._id, user: user._id }))
      return bad(409, "email", `${email} is already registered for this event.`);

    amount += user.tier === "dgsa" ? event.priceMember : event.priceNonMember; // price comes from the server, not the browser
    players.push({ user, division });
  }

  const payment = await Payment.create({
    user: req.user._id,
    type: "event",
    event: event._id,
    amount,
    proofFile: req.file.filename,
  });

  try {
    await Registration.insertMany(
      players.map((p) => ({
        event: event._id,
        user: p.user._id,
        registeredBy: req.user._id,
        division: p.division || undefined,
        payment: payment._id,
      }))
    );
  } catch (err) {
    await Payment.findByIdAndDelete(payment._id); // don't leave a payment with no registrations
    throw err;
  }

  res.status(201).json({ message: "Registration submitted.", amount });
});

// GET /api/registrations/mine  (My Event Registrations)
export const mine = asyncHandler(async (req, res) => {
  const regs = await Registration.find({ user: req.user._id }).populate("event");
  const rows = regs
    .filter((r) => r.event)
    .map((r) => ({
      id: r._id,
      eventId: r.event._id,
      name: r.event.name,
      location: r.event.location,
      startsAt: r.event.startsAt,
      endsAt: r.event.endsAt || null,
    }))
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  res.json({ registrations: rows });
});

// GET /api/admin/registrations?eventId=  (Tournament Registrations)
export const adminList = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.eventId) {
    if (!mongoose.isValidObjectId(req.query.eventId)) return res.json({ registrations: [] });
    filter.event = req.query.eventId;
  }
  const regs = await Registration.find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("user", "name tier")
    .populate("event", "name");

  res.json({
    registrations: regs
      .filter((r) => r.user && r.event)
      .map((r) => ({
        id: r._id,
        name: r.user.name,
        tier: r.user.tier,
        tournament: r.event.name,
        paymentId: r.payment,
      })),
  });
});