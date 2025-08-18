import multer from "multer";
import path from "path";
import fs from "fs";
import Vendor from "../Models/vendorModel.js";   // import Vendor model
import { generateReferralCode } from "../Utils/generateReferralCode.js";

const uploadDir = path.resolve("uploads/vendor");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: async (req, file, cb) => {
        try {
            let referralCode;

            if (req.params.id) {
                // ✅ UPDATE vendor → fetch referralCode from DB
                const vendor = await Vendor.findById(req.params.id);
                if (!vendor) return cb(new Error("Vendor not found while updating"));
                referralCode = vendor.referralCode;
            } else {
                // ✅ ADD vendor → generate referralCode
                const { firstName, phone } = req.body;
                if (!firstName || !phone) {
                    return cb(new Error("First name and phone are required to generate referral code"));
                }
                referralCode = generateReferralCode(firstName, phone);
            }

            // ✅ Attach referralCode to req (controller will use it)
            req.referralCode = referralCode;

            // Save image with referralCode + extension
            const filename = `${referralCode}${path.extname(file.originalname)}`;
            cb(null, filename);
        } catch (err) {
            cb(err);
        }
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

export const vendorUpload = multer({ storage, fileFilter });
