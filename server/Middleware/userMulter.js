// multer config (userUpload.js)
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../Models/userModel.js"; // make sure this path is correct

// Ensure uploads/user directory exists
const uploadDir = path.resolve("uploads/user");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: async (req, file, cb) => {
        try {
            let referralCode = "USER"; // fallback if not found

            // If updating profile, get referral code from DB
            if (req.params.userId) {
                const user = await User.findById(req.params.userId).select("referralCode");
                if (user && user.referralCode) {
                    referralCode = user.referralCode;
                }
            }

            const ext = path.extname(file.originalname);
            cb(null, `${referralCode}-${file.fieldname}${ext}`);
        } catch (err) {
            cb(err, null);
        }
    },
});

// Only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

export const userUpload = multer({ storage, fileFilter });
