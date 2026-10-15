// Sample data matching the dashboard designs. Wipes the database first: development only.
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Event from "./models/Event.js";
import Payment from "./models/Payment.js";
import Registration from "./models/Registration.js";
import Counter, { nextSequence } from "./models/Counter.js";

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed in production.");
  process.exit(1);
}
const { SEED_ADMIN_EMAIL, SEED_PASSWORD } = process.env;
if (!SEED_ADMIN_EMAIL || !SEED_PASSWORD) {
  console.error("Set SEED_ADMIN_EMAIL and SEED_PASSWORD in .env first.");
  process.exit(1);
}

await connectDB();
await Promise.all([User, Event, Payment, Registration, Counter].map((m) => m.deleteMany({})));

const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
const mk = async (name, email, extra = {}) =>
  User.create({ name, email, passwordHash, dgsaMembershipId: await nextSequence("dgsaMembershipId"), ...extra });

const admin = await mk("Bart Meulenbeld", SEED_ADMIN_EMAIL, { role: "admin" });
const josephine = await mk("Josephine Meulenbeld", "josephine@example.test", { tier: "dgsa", mobile: "+27 (82) 674 0821" });
const lienke = await mk("Lienke Brazendale", "lienke@example.test", { status: "inactive", mobile: "+27 (71) 249 8934" });
const ntsika = await mk("Ntsika Madlala", "ntsika@example.test", { tier: "dgsa", mobile: "+27 (62) 623 7226" });
const kiera = await mk("Kiera Poley", "kiera@example.test", { tier: "dgsa", mobile: "+27 (71) 249 8934" });
const annemay = await mk("Annémay Fogwill", "annemay@example.test", { mobile: "+27 (71) 249 8934" });
const robbie = await mk("Robbie Le Roux", "robbie@example.test");

// Poster files don't exist for seeded events: add real images in uploads/posters to see them
const poster = "/uploads/posters/seed-placeholder.jpg";
const at = (iso) => new Date(`${iso}+02:00`);
const ev = (name, startsAt, endsAt) =>
  Event.create({
    name, startsAt, endsAt,
    location: "Inanda Disc Golf Course, Kyalami",
    description: "Sample event.",
    posterUrl: poster,
    pdgaTier: "A-Tier",
    priceNonMember: 300, // sample prices
    priceMember: 300,
    bankDetails: "Sample bank details",
    createdBy: admin._id,
  });

const championship = await ev("1st African Disc Golf Championship", at("2026-11-06T07:00:00"), at("2026-11-08T17:00:00"));
const sao = await ev("South Africa Open", at("2026-06-12T07:00:00"));
const doubles = await ev("Ladies and Mens Doubles", at("2026-06-13T07:00:00"), at("2026-06-14T17:00:00"));
const singles = await ev("Ladies Singles", at("2026-06-24T10:00:00"));
const eden = await ev("Eden Christmas Clash", at("2027-12-21T07:00:00"));
const gauteng = await ev("Gauteng Winter League", at("2027-01-28T07:00:00"));

const proofFile = "seed-placeholder.pdf"; // missing on disk: proof links 404 for seeded rows
const pay = (user, type, status, event) =>
  Payment.create({ user: user._id, type, status, event: event?._id, amount: type === "membership" ? 370 : 300, proofFile });
const register = async (user, event, status) => {
  const payment = await pay(user, "event", status, event);
  await Registration.create({ event: event._id, user: user._id, registeredBy: user._id, payment: payment._id });
};

await pay(robbie, "membership", "overdue");
await pay(josephine, "membership", "on_time");
await pay(lienke, "membership", "overdue");
await pay(annemay, "membership", "on_time");

for (const e of [sao, doubles, singles, eden, gauteng]) await register(josephine, e, "on_time");
await register(ntsika, sao, "pending");
await register(lienke, sao, "on_time");
await register(kiera, sao, "on_time");
await register(annemay, sao, "on_time");
void championship;

console.log("Seeded. Log in as", SEED_ADMIN_EMAIL, "(admin) or josephine@example.test (member) with SEED_PASSWORD.");
await mongoose.disconnect();