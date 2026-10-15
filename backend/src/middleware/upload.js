import fs from "node:fs";
import crypto from "node:crypto";
import multer from "multer";
import { POSTERS_DIR, PROOFS_DIR } from "../config/constants.js";

fs.mkdirSync(POSTERS_DIR, { recursive: true });
fs.mkdirSync(PROOFS_DIR, { recursive: true });

const EXT = { "application/pdf": ".pdf", "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp" };

function makeUploader(dir, allowedTypes) {
  return multer({
    storage: multer.diskStorage({
      destination: dir,
      // Random name, extension from the checked MIME type (never trust the original name)
      filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXT[file.mimetype]),
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
    fileFilter: (req, file, cb) =>
      allowedTypes.includes(file.mimetype)
        ? cb(null, true)
        : cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)),
  });
}

export const uploadProof = makeUploader(PROOFS_DIR, ["application/pdf", "image/png", "image/jpeg"]);
export const uploadPoster = makeUploader(POSTERS_DIR, ["image/png", "image/jpeg", "image/webp"]);