import multer from "multer";

export const notFound = (req, res) => res.status(404).json({ message: "Not found." });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "That file is too big (5 MB maximum)."
        : "Unsupported file type.";
    return res.status(400).json({ field: err.field === "poster" ? "poster" : "proof", message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "That already exists." });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong on our side." });
}