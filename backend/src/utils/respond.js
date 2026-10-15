import fs from "node:fs/promises";

// Removes a just-uploaded file (if any) and sends an error.
// Used when validation fails after multer has already saved the file.
export async function reject(req, res, status, body) {
  if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
  return res.status(status).json(body);
}