import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { POSTERS_DIR } from "./config/constants.js";
import Event from "./models/Event.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.join(__dirname, "../../frontend/build");

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      "script-src": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
      "connect-src": ["'self'", "https://www.google-analytics.com", "https://analytics.google.com"],
    },
  },
})); // lets the React app show poster images
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Posters are public. Proofs of payment are NOT served statically: see GET /api/payments/:id/proof
app.use("/uploads/posters", express.static(POSTERS_DIR, { maxAge: "7d" }));

app.use("/api", routes);

if (process.env.NODE_ENV === "production") {
  app.get("/sitemap.xml", async (req, res, next) => {
    try {
      const baseUrl = (process.env.PUBLIC_URL || process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
      const events = await Event.find({}).select("_id updatedAt").sort({ updatedAt: -1 }).limit(500);
      const urls = [
        { loc: `${baseUrl}/`, lastmod: new Date().toISOString().slice(0, 10) },
        { loc: `${baseUrl}/login` },
        { loc: `${baseUrl}/signup` },
        ...events.map((event) => ({
          loc: `${baseUrl}/events/${event._id}`,
          lastmod: event.updatedAt?.toISOString().slice(0, 10),
        })),
      ];
      const xml = urls.map(({ loc, lastmod }) =>
        `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`
      ).join("");
      res.type("application/xml").send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`
      );
    } catch (error) {
      next(error);
    }
  });
  app.use(express.static(frontendBuildPath));
  app.use((req, res, next) => {
    if ((req.method === "GET" || req.method === "HEAD") && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(frontendBuildPath, "index.html"));
    }
    next();
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;