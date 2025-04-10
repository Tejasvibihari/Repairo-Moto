import Vendor from "../Models/vendorModel.js";
import bcrypt from "bcryptjs";
export const addVendor = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, address, city, state, pincode, gstNo, businessName } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !address || !city || !state || !pincode) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Handle profile image if uploaded
        let profileImage = null;
        if (req.file) {
            profileImage = `uploads/vendor/${req.file.filename}`;
        }
        // create password from first 4 letter from firstname and last 4 digit from phone
        
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
            profileImage,
        });

        // Save the vendor to the database
        await newVendor.save();

        res.status(201).json({ message: "Vendor added successfully", vendor: newVendor });
    } catch (error) {
        console.error("Error adding vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};