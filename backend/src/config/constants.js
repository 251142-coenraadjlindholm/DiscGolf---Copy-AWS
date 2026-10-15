import path from "node:path";

// Fees: confirm with DGSA (the tier card shows R375, the payment screen shows R370)
export const MEMBERSHIP_FEE = 370;

// Same list the registration form uses: confirm against the design
export const DIVISIONS = ["FPO", "MPO", "MA1", "MA2", "MA3", "FA1", "FA2", "FA3"];

export const MAX_REGISTRANTS = 8; // dropdown offers 1 to 8 players

export const PAYMENT_STATUSES = ["pending", "on_time", "overdue"];

export const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
export const POSTERS_DIR = path.join(UPLOADS_DIR, "posters");
export const PROOFS_DIR = path.join(UPLOADS_DIR, "proofs");