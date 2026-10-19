import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const cookieOptions = () => ({
  httpOnly: true, // JavaScript in the browser can't read the token
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: WEEK_MS,
});

export function setAuthCookie(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, cookieOptions());
}

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Please log in." });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Your session expired. Please log in again." });
  }

  // Role and tier always come from the database, never from the token
  const user = await User.findById(payload.id);
  if (!user) return res.status(401).json({ message: "Please log in." });

  req.user = user;
  next();
});

export const optionallyAuthenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id);
  } catch {
    req.user = null;
  }

  next();
});

export const requireAdmin = (req, res, next) =>
  req.user?.role === "admin" ? next() : res.status(403).json({ message: "Admins only." });