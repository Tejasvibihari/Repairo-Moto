import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";
import { generateReferralCode } from "../Utils/generateReferralCode.js";

export const createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            email,
            password,
            referredBy,
            accountType,
            businessName,
            address,
            city,
            state,
            pincode,
            businessType
        } = req.body;

        // Validate required fields
        if (!firstName || !phone || !email || !password || !accountType || !address || !city || !state || !pincode) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: "User with phone or email already exists" });
        }

        // Handle profile image if uploaded
        let profileImage = null;
        if (req.file) {
            profileImage = `uploads/user/${req.file.filename}`;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a referral code
        const referralCode = generateReferralCode(firstName, phone);

        // Create user object
        const newUser = new User({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            referralCode,
            referredBy,
            accountType,
            businessName,
            address,
            city,
            state,
            pincode,
            businessType,
            profileImage
        });

        // Save to DB
        await newUser.save();

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                referralCode: newUser.referralCode,
                accountType: newUser.accountType
            }
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
