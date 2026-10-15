import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { eventDTO } from "../utils/validators.js";

// GET /api/dashboard/member
export const member = asyncHandler(async (req, res) => {
  const now = new Date();
  const upcoming = await Event.find({
    $or: [{ endsAt: { $gte: now } }, { endsAt: null, startsAt: { $gte: now } }],
  })
    .sort({ startsAt: 1 })
    .limit(12);

  const regs = await Registration.find({ user: req.user._id }).populate("event");
  const myRegistrations = regs
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

  res.json({
    featuredEvent: upcoming.length ? eventDTO(upcoming[0]) : null, // "What's Happening Soon"
    upcomingEvents: upcoming.map(eventDTO),
    myRegistrations,
  });
});