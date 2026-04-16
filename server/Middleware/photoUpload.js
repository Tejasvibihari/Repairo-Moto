import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join("uploads", "orders", req.params.id);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname; // "beforePhoto" or "afterPhoto"
        cb(null, `${prefix}-${Date.now()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed."));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

// Wrapper that deletes the uploaded file if the subsequent handler throws an error
export const uploadSingle = (fieldName) => {
    return async (req, res, next) => {
        const uploadMiddleware = upload.single(fieldName);
        uploadMiddleware(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            // Attach a cleanup function to req for later use
            req.cleanupUploadedFile = () => {
                if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            };
            next();
        });
    };
};