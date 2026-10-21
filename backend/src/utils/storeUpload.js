import fs from "node:fs/promises";
import Upload from "../models/Upload.js";

export async function storeUpload(file, kind) {
  const data = await fs.readFile(file.path);
  await Upload.findOneAndUpdate(
    { filename: file.filename },
    { filename: file.filename, kind, contentType: file.mimetype, data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}
