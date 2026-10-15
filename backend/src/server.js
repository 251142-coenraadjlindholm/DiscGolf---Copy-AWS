import "dotenv/config";
import { connectDB } from "./config/db.js";
import { ensureAdminAccount } from "./config/admin.js";
import app from "./app.js";

for (const key of ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD"]) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in .env`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters.");
  process.exit(1);
}

await connectDB();
await ensureAdminAccount();

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));