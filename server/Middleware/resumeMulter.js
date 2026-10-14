import multer from "multer";
import path from "path";
import fs from "fs";

// Resumes contain personal data, so they are NOT stored under /uploads
// (which index.js serves publicly). They are only reachable through the
// authenticated admin download endpoint.
export const RESUME_DIR = path.resolve("private_uploads/resumes");
if (!fs.existsSync(RESUME_DIR)) {
    fs.mkdirSync(RESUME_DIR, { recursive: true });
}

const ALLOWED_EXT = [".pdf", ".doc", ".docx"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, RESUME_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `resume-${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXT.includes(ext)) return cb(null, true);
    cb(new Error("Resume must be a PDF, DOC or DOCX file."), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE, files: 1 } });

// Wrapper so multer failures come back as JSON 400s instead of Express's default HTML 500.
export const resumeUpload = (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
        if (!err) return next();
        const message =
            err.code === "LIMIT_FILE_SIZE"
                ? "Resume must be 5 MB or smaller."
                : err.message || "Resume upload failed.";
        return res.status(400).json({ success: false, message });
    });
};
