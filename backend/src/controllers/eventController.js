import mongoose from "mongoose";
import Event from "../models/Event.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { reject } from "../utils/respond.js";
import { asString, eventDTO } from "../utils/validators.js";
import { storeUpload } from "../utils/storeUpload.js";

const upcomingFilter = () => {
  const now = new Date();
  // not finished yet: ends in the future, or (no end date) starts in the future
  return { $or: [{ endsAt: { $gte: now } }, { endsAt: null, startsAt: { $gte: now } }] };
};

// GET /api/events?upcoming=true
export const list = asyncHandler(async (req, res) => {
  const filter = req.query.upcoming === "true" ? upcomingFilter() : {};
  const events = await Event.find(filter).sort({ startsAt: 1 }).limit(200);
  res.json({ events: events.map(eventDTO) });
});

// GET /api/events/:id
export const getOne = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Event not found." });
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found." });
  res.json({ event: eventDTO(event) });
});

// POST /api/events   (admin) multipart: poster + fields
export const create = asyncHandler(async (req, res) => {
  const b = req.body;
  const bad = (field, message) => reject(req, res, 400, { field, message });

  const name = asString(b.name);
  const location = asString(b.location);
  const description = asString(b.description);
  const bankDetails = asString(b.bankDetails);
  const pdgaTier = asString(b.pdgaTier);

  if (!req.file) return bad("poster", "Upload an event poster.");
  if (!name) return bad("name", "Enter the event name.");
  if (!location) return bad("location", "Enter the location.");
  if (!pdgaTier) return bad("pdgaTier", "Select a PDGA tier.");
  if (!description) return bad("description", "Enter an event description.");
  if (!bankDetails) return bad("bankDetails", "Enter the bank details.");

  // South Africa has no daylight saving, so a fixed +02:00 offset is correct
  const toDate = (d, t) =>
    /^\d{4}-\d{2}-\d{2}$/.test(d) && /^\d{2}:\d{2}$/.test(t) ? new Date(`${d}T${t}:00+02:00`) : null;

  const startsAt = toDate(asString(b.startDate), asString(b.startTime));
  if (!startsAt || Number.isNaN(startsAt.getTime())) return bad("startDate", "Select a start date and time.");

  let endsAt;
  if (b.endDate || b.endTime) {
    endsAt = toDate(asString(b.endDate), asString(b.endTime));
    if (!endsAt || Number.isNaN(endsAt.getTime())) return bad("endDate", "Select both an end date and time.");
    if (endsAt < startsAt) return bad("endDate", "The end can't be before the start.");
  }

  const priceNonMember = Number(b.priceNonMember);
  const priceMember = Number(b.priceMember);
  if (!Number.isFinite(priceNonMember) || priceNonMember < 0) return bad("priceNonMember", "Enter the non-member price.");
  if (!Number.isFinite(priceMember) || priceMember < 0) return bad("priceMember", "Enter the DGSA member price.");
  await storeUpload(req.file, "poster");

  const event = await Event.create({
    name, location, description, bankDetails, pdgaTier,
    startsAt, endsAt, priceNonMember, priceMember,
    posterUrl: `/uploads/posters/${req.file.filename}`,
    createdBy: req.user._id,
  });

  res.status(201).json({ event: eventDTO(event) });
});