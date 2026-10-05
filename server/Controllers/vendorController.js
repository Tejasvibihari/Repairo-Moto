import Vendor from "../Models/vendorModel.js";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../Utils/generateReferralCode.js"
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { localNumber, phoneMatchQuery } from "../Utils/phone.js";

const INVALID_PHONE = "Enter a valid 10-digit mobile number.";
const DUPLICATE_PHONE = "A vendor with this phone number already exists";

/** Token + response body for a logged-in vendor. Shared by password login and WhatsApp-OTP login. */
export const buildVendorSession = (vendor) => {
    const token = jwt.sign(
        { id: vendor._id, role: vendor.role },
        process.env.VENDOR_JWT_SECRET,
        { expiresIn: "1d" } // Token expires in 1 day
    );
    // Exclude the password (and any stored OTP) from the response
    const { password: _p, otp: _o, otpExpires: _e, ...vendorData } = vendor._doc;
    return { message: "Sign-in successful", token, vendor: vendorData };
};


export const addVendor = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, address, city, state, pincode, gstNo, businessName, googleLocation } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !address || !city || !state || !pincode || !gstNo || !businessName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Phone must be a real mobile number and unique (like email)
        const localPhone = localNumber(phone);
        if (!localPhone) {
            return res.status(400).json({ message: INVALID_PHONE });
        }
        if (await Vendor.findOne({ email }).select("_id").lean()) {
            return res.status(400).json({ message: "A vendor with this email already exists" });
        }
        if (await Vendor.findOne(phoneMatchQuery(localPhone)).select("_id").lean()) {
            return res.status(400).json({ message: DUPLICATE_PHONE });
        }

        // Handle profile image if uploaded
        let profileImage = null;
        if (req.file) {
            profileImage = `/uploads/vendor/${req.file.filename}`;
        }

        // Create password from the first 4 letters of firstName and the last 4 digits of phone
        const password = `${firstName.slice(0, 4)}${localPhone.slice(-4)}`;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = req.referralCode;
        // Create a new vendor
        const newVendor = new Vendor({
            firstName,
            lastName,
            phone: localPhone,
            email,
            address,
            city,
            state,
            pincode,
            googleLocation,
            gstNo,
            businessName,
            profileImage,
            referralCode,
            password: hashedPassword, // Save the hashed password
        });

        // Save the vendor to the database
        await newVendor.save();
        console.log("Hello ssvae ")
        const allVendor = await Vendor.find();
        res.status(201).json({
            message: "Vendor added successfully",
            vendor: allVendor,
            generatedPassword: password // Send the generated password in the response (optional)
        });
    } catch (error) {
        if (error?.code === 11000) {   // two requests raced past the checks above
            const field = Object.keys(error.keyPattern || {})[0];
            return res.status(400).json({ message: field === "phone" ? DUPLICATE_PHONE : "A vendor with this email already exists" });
        }
        console.error("Error adding vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Vendor Sign In
export const vendorSignIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the employee exists
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, vendor.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.status(200).json(buildVendorSession(vendor));
    } catch (error) {
        console.error("Error during vendor sign-in:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllVendor = async (req, res) => {
    try {
        // Fetch all vendors from the database
        const vendors = await Vendor.find();

        // Return the list of vendors
        res.status(200).json({
            message: "Vendors fetched successfully",
            vendors,
        });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;

        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        if (vendor.profileImage) {
            // vendor.profileImage = "/uploads/vendor/TEJA115051.jpg"
            const imagePath = path.resolve(`.${vendor.profileImage}`);

            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully:", imagePath);
                }
            });
        }

        await Vendor.findByIdAndDelete(id);

        const updatedVendors = await Vendor.find();
        res.status(200).json({
            message: "Vendor deleted successfully",
            vendors: updatedVendors,
        });
    } catch (error) {
        console.error("Error deleting vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateVendorById = async (req, res) => {
    const { id } = req.params;

    try {
        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Phone: only touched when sent; must be valid and not used by another vendor
        let nextPhone = vendor.phone;
        if (req.body.phone !== undefined && String(req.body.phone).trim() !== "") {
            const localPhone = localNumber(req.body.phone);
            if (!localPhone) {
                return res.status(400).json({ message: INVALID_PHONE });
            }
            const clash = await Vendor.findOne({ ...phoneMatchQuery(localPhone), _id: { $ne: id } }).select("_id").lean();
            if (clash) {
                return res.status(400).json({ message: DUPLICATE_PHONE });
            }
            nextPhone = localPhone;
        }

        let profileImage = vendor.profileImage;

        if (req.file) {
            // ✅ Delete old image if exists
            if (vendor.profileImage) {
                // vendor.profileImage = "/uploads/employee/TEJA115020.jpg"
                const oldImagePath = path.resolve(`.${vendor.profileImage}`);

                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error("Error deleting old image:", err);
                    } else {
                        console.log("Old image deleted successfully:", oldImagePath);
                    }
                });
            }

            // ✅ Save new image path (URL format)
            profileImage = `/uploads/vendor/${req.file.filename}`;
        }

        // Update vendor
        const updatedVendor = await Vendor.findByIdAndUpdate(
            id,
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: nextPhone,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
                gstNo: req.body.gstNo,
                businessName: req.body.businessName,
                profileImage,
            },
            { new: true }
        );

        res
            .status(200)
            .json({ message: "Vendor updated successfully", vendor: updatedVendor });
    } catch (error) {
        if (error?.code === 11000 && error.keyPattern?.phone) {
            return res.status(400).json({ message: DUPLICATE_PHONE });
        }
        console.error("Error updating vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};