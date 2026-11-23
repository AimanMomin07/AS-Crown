import multer from "multer";
import path from "path";
import fs from "fs";

const directory = path.join(process.cwd(), "uploads", "community");
if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

const allowed = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4"
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, directory),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `community-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new Error("Only JPG, PNG, WEBP, PDF and audio files are allowed."));
    cb(null, true);
  },
  limits: { fileSize: 15 * 1024 * 1024 }
});

export default upload;
