import Vendor from "../Models/vendorModel.js";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../Utils/generateReferralCode.js"
import fs from "fs";
import path from "path";
export const addVendor = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, address, city, state, pincode, gstNo, businessName } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !address || !city || !state || !pincode || !gstNo || !businessName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Handle profile image if uploaded
        let profileImage = null;
        if (req.file) {
            profileImage = `uploads/vendor/${req.file.filename}`;
        }

        // Create password from the first 4 letters of firstName and the last 4 digits of phone
        const password = `${firstName.slice(0, 4)}${phone.slice(-4)}`;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = generateReferralCode(firstName, phone);
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

        // Find the vendor by ID
        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        if (vendor.profileImage) {
            fs.unlink(vendor.profileImage, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully:", vendor.profileImage);
                }
            });
        }
        // Delete the vendor from the database
        await Vendor.findByIdAndDelete(id);

        // Get the updated vendor list
        const updatedVendors = await Vendor.find();

        res.status(200).json({
            message: "Vendor deleted successfully",
            vendors: updatedVendors
        });
    } catch (error) {
        console.error("Error deleting vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateVendorById = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    
    try {

        // Find the employee by ID
        const vendor = await Vendor.findById(id);
        if (!vendor) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Handle uploaded file
        let profileImage = vendor.profileImage; // Keep the existing image by default
        if (req.file) {
            // Delete the old image if it exists
            if (vendor.profileImage) {
                fs.unlink(vendor.profileImage, (err) => {
                    if (err) {
                        console.error("Error deleting old image:", err);
                    } else {
                        console.log("Old image deleted successfully:", vendor.profileImage);
                    }
                });
            }
            // Set the new image path
            profileImage = `uploads/employee/${req.file.filename}`;
        }

        // Update employee details
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
                profileImage, // Update the profile image
            },
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: "Vendor updated successfully", vendor: updatedVendor });
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};