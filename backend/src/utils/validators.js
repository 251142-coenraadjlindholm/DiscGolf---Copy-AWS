export const asString = (v) => (typeof v === "string" ? v.trim() : "");

export const isEmail = (v) =>
  typeof v === "string" && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const hasDigits = (v) => /\d/.test(v);

export const isZip = (v) => /^\d{4}$/.test(v); // 4 digits, numbers only: confirm against the design

// Rules from the sign-up design: more than 8 characters, mixed case,
// one special character, two numbers. (72 is bcrypt's input limit.)
export function passwordProblems(pw) {
  const problems = [];
  if (typeof pw !== "string" || pw.length <= 8) problems.push("more than 8 characters");
  if (typeof pw === "string" && pw.length > 72) problems.push("no more than 72 characters");
  if (!/[a-z]/.test(pw || "") || !/[A-Z]/.test(pw || "")) problems.push("upper and lower case letters");
  if (!/[^A-Za-z0-9]/.test(pw || "")) problems.push("one special character");
  if (((pw || "").match(/\d/g) || []).length < 2) problems.push("two numbers");
  return problems;
}

export const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  tier: u.tier,
  status: u.status,
  dgsaMembershipId: u.tier === "dgsa" ? u.dgsaMembershipId ?? null : null,
  avatarUrl: u.avatarUrl || null,
});

export const eventDTO = (e) => ({
  id: e._id,
  name: e.name,
  location: e.location,
  description: e.description,
  posterUrl: e.posterUrl,
  pdgaTier: e.pdgaTier,
  startsAt: e.startsAt,
  endsAt: e.endsAt || null,
  priceNonMember: e.priceNonMember,
  priceMember: e.priceMember,
  bankDetails: e.bankDetails,
});