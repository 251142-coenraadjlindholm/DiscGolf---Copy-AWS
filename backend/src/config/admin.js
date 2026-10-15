import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { isEmail } from "../utils/validators.js";

export async function ensureAdminAccount() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.");
  }
  if (!isEmail(email)) throw new Error("ADMIN_EMAIL must be a valid email address.");
  if (password.length < 9) throw new Error("ADMIN_PASSWORD must be more than 8 characters.");

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.findOneAndUpdate(
    { email },
    { $set: { role: "admin", passwordHash } },
    { returnDocument: "after", upsert: false }
  );

  if (!admin) {
    await User.create({ name: "Administrator", email, passwordHash, role: "admin" });
    console.log(`Admin account created for ${email}`);
  } else {
    console.log(`Admin account ready for ${email}`);
  }
}
