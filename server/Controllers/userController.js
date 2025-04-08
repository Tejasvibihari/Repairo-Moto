import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../Utils/generateReferalCode.js";

export const createUser = async (req, res) => {
    const { firstName, lastName, email, password, phone, rating } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Generate a unique referral code
        const referralCode = generateReferralCode(firstName, phone);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            rating,
            referralCode
        });
        await newUser.save();

        // Exclude the password field before sending the response
        const userWithoutPassword = {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone,
            rating: newUser.rating,
            referralCode: newUser.referralCode,
        };

        res.status(201).json({ user: userWithoutPassword, message: "User created successfully" });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const userSignIn = async (req, res) => {
    const { email, password } = req.body;
    try {


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}