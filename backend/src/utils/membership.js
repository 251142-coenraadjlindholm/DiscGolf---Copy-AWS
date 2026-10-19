import { randomInt } from "crypto";
import User from "../models/User.js";

export async function createMembershipId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const membershipId = randomInt(100000, 1000000);
    if (!(await User.exists({ dgsaMembershipId: membershipId }))) return membershipId;
  }
  throw new Error("Unable to allocate a unique DGSA membership ID.");
}
