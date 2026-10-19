import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { asString, isEmail, hasDigits, passwordProblems, publicUser } from "../utils/validators.js";
import { setAuthCookie, cookieOptions } from "../middleware/auth.js";

// POST /api/auth/signup  { name, email, password }
export const signup = asyncHandler(async (req, res) => {
  const name = asString(req.body.name);
  const email = asString(req.body.email).toLowerCase();
  const { password } = req.body;

  if (!name || name.length > 120 || hasDigits(name))
    return res.status(400).json({ field: "name", message: "Enter your name and surname (no numbers)." });
  if (!isEmail(email))
    return res.status(400).json({ field: "email", message: "Enter a valid email address." });

  const problems = passwordProblems(password);
  if (problems.length)
    return res.status(400).json({ field: "password", message: `Password needs: ${problems.join(", ")}.` });

  if (await User.exists({ email }))
    return res.status(409).json({ field: "email", message: "An account with this email already exists." });

  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
  });

  setAuthCookie(res, user);
  res.status(201).json({ user: publicUser(user) });
});

// POST /api/auth/login  { email, password }
export const login = asyncHandler(async (req, res) => {
  const email = asString(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!isEmail(email) || !password)
    return res.status(400).json({ message: "Enter your email and password." });

  const user = await User.findOne({ email }).select("+passwordHash");

  // The design asks for specific messages, so email and password errors are reported separately.
  // (This reveals which emails have accounts: the login rate limit slows down anyone probing for that.)
  if (!user)
    return res.status(401).json({ field: "email", message: "Email not found. This user must create an account." });

  if (!(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ field: "password", message: "Incorrect password." });

  setAuthCookie(res, user);
  res.json({ user: publicUser(user) });
});

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("token", { ...cookieOptions(), maxAge: undefined });
  res.json({ ok: true });
};

// GET /api/auth/me
export const me = (req, res) => res.json({ user: req.user ? publicUser(req.user) : null });