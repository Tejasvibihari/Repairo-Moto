import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define base directories
const baseUploadDir = path.resolve('uploads/employees');

// Create necessary directories
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const paths = {
    profileImage: `${baseUploadDir}/profile`,
    aadharFront: `${baseUploadDir}/aadhar/front`,
    aadharBack: `${baseUploadDir}/aadhar/back`,
    dlImage: `${baseUploadDir}/dl`
};

// Ensure all folders exist
Object.values(paths).forEach(ensureDirExists);

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fieldToPathMap = {
            profileImage: paths.profileImage,
            aadharFront: paths.aadharFront,
            aadharBack: paths.aadharBack,
            dlImage: paths.dlImage
        };
        const uploadPath = fieldToPathMap[file.fieldname];
        if (!uploadPath) return cb(new Error('Invalid field name for image upload'), false);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Exported upload middleware
export const employeeUpload = multer({
    storage,
    fileFilter
});
