import Vendor from "../Models/vendorModel.js";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../Utils/generateReferralCode.js"
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";


export const addVendor = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, address, city, state, pincode, gstNo, businessName, googleLocation } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !address || !city || !state || !pincode || !gstNo || !businessName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Handle profile image if uploaded
        let profileImage = null;
        if (req.file) {
            profileImage = `/uploads/vendor/${req.file.filename}`;
        }

        // Create password from the first 4 letters of firstName and the last 4 digits of phone
        const password = `${firstName.slice(0, 4)}${phone.slice(-4)}`;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = req.referralCode;
        // Create a new vendor
        const newVendor = new Vendor({
            firstName,
            lastName,
            phone,
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
        console.error("Error adding vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Employee Sign In 
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

        // Generate a JWT token
        const token = jwt.sign(
            { id: vendor._id, role: vendor.role },
            process.env.VENDOR_JWT_SECRET,
            { expiresIn: "1d" } // Token expires in 1 day
        );

        // Exclude the password from the response
        const { password: _, ...vendorData } = vendor._doc;

        // Send the response
        res.status(200).json({
            message: "Sign-in successful",
            token,
            vendor: vendorData, // Send all employee data excluding the password
        });
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
                phone: req.body.phone,
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
        console.error("Error updating vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};