import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";
import { generateReferralCode } from "../Utils/generateReferralCode.js";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            email,
            password,
            referralType,
            referredBy,
            accountType,
            businessName,
            address,
            city,
            state,
            pincode,
            businessType
        } = req.body;



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
            referralType,
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


export const usrSignIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email }, // Payload
            process.env.USER_JWT_SECRET, // Secret key
            { expiresIn: "1h" } // Token expiration time
        );

        // Return success response with token
        res.status(200).json({
            token,
            user: user
        });
        res.status(200).json({
            message: "Sign-in successful",
            token, // Include the token in the response
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                referralCode: user.referralCode,
                accountType: user.accountType,
                phone: user.phone,
                profileImage: user.profileImage,
                address: user.address,
                city: user.city,
                state: user.state,
                pincode: user.pincode,
                businessName: user.businessName,
                businessType: user.businessType,
                referredBy: user.referredBy,
                referralType: user.referralType,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllUser = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find().select("-password"); // Exclude the password field for security

        // Return the list of users
        res.status(200).json({
            message: "Users fetched successfully",
            users,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllUserByReferralCode = async (req, res) => {
    try {
        const { referalcode } = req.params;

        if (!referalcode) {
            return res.status(400).json({ success: false, message: "Referral code is required." });
        }

        const users = await User.find({ referredBy: referalcode });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error("Error fetching referred users:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            phone,
            email,
            accountType,
            businessName,
            businessType,
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 🖼️ Handle Profile Image
        if (req.file) {
            user.profileImage = `/uploads/profile/${req.file.filename}`;
        }

        // ✏️ Update basic fields
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        user.email = email;
        user.accountType = accountType;
        user.businessName = accountType === 'business' ? businessName : null;
        user.businessType = accountType === 'business' ? businessType : null;

        // 🔐 Password Update
        if (currentPassword || newPassword || confirmPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'New password and confirmation do not match' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("-password"); // Exclude password from the response

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}