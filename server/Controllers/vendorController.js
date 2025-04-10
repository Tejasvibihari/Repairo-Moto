import Vendor from "../Models/vendorModel.js";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../Utils/generateReferralCode.js"

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

        res.status(201).json({
            message: "Vendor added successfully",
            vendor: newVendor,
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