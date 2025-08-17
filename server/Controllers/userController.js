import bcrypt from "bcryptjs";
import User from "../Models/userModel.js";
import { generateReferralCode } from "../Utils/generateReferralCode.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { sendWelcomeEmail } from '../Utils/mailer.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            email,
            password,
            accountType,
            referredBy,
            businessName,
            address,
            city,
            state,
            pincode,
            businessType
        } = req.body;

        const { accountType: referralType } = req.params;

        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: "User with phone or email already exists" });
        }

        // Handle profile image if uploaded
        let profileImage = null;
        if (req.file) {
            profileImage = `/uploads/user/${req.file.filename}`;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a referral code
        const referralCode = generateReferralCode(firstName, phone);

        // Prepare new user data
        const newUserData = {
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            referralCode,
            referralType,
            referredBy: referredBy || null,
            accountType,
            businessName,
            address,
            city,
            state,
            pincode,
            businessType,
            profileImage
        };

        // 🚀 Referral logic
        if (referredBy) {
            // 1. Check if referral code exists
            const referrer = await User.findOne({ referralCode: referredBy });

            if (!referrer) {
                return res.status(400).json({ message: "Invalid referral code" });
            }

            // 2. Handle based on referrer's account type
            if (referrer.accountType === "personal") {
                referrer.pendingReferralAmount = (referrer.pendingReferralAmount || 0) + 50;
                referrer.referralCount = (referrer.referralCount || 0) + 1;
                await referrer.save();
            } else if (referrer.accountType === "business") {
                // Only count referral, no money
                referrer.referralCount = (referrer.referralCount || 0) + 1;
                await referrer.save();
            }

            // Save referredBy for record in the new user
            newUserData.referredBy = referredBy;
        }
        if (accountType === "personal") {
            newUserData.status = "approved"; // Set status to active for personal accounts
        }
        // Create new user
        const newUser = new User(newUserData);
        await newUser.save();

        // Send welcome email
        await sendWelcomeEmail({ firstName, lastName, email, accountType, referralCode });

        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: newUser._id,
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



export const userSignIn = async (req, res) => {
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
        res.status(200).json({
            message: "Sign-in successful",
            token, // Include the token in the response
            user: {
                _id: user._id,
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
                status: user.status,
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


// export const updateUser = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const {
//             firstName,
//             lastName,
//             phone,
//             email,
//             accountType,
//             businessName,
//             businessType,
//             currentPassword,
//             newPassword,
//             confirmPassword,
//         } = req.body;

//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         // 🖼️ Handle Profile Image
//         if (req.file) {
//             user.profileImage = `/uploads/profile/${req.file.filename}`;
//         }

//         // ✏️ Update basic fields
//         user.firstName = firstName;
//         user.lastName = lastName;
//         user.phone = phone;
//         user.email = email;
//         user.accountType = accountType;
//         user.businessName = accountType === 'business' ? businessName : null;
//         user.businessType = accountType === 'business' ? businessType : null;

//         // 🔐 Password Update
//         if (currentPassword || newPassword || confirmPassword) {
//             const isMatch = await bcrypt.compare(currentPassword, user.password);
//             if (!isMatch) {
//                 return res.status(400).json({ message: 'Current password is incorrect' });
//             }

//             if (newPassword !== confirmPassword) {
//                 return res.status(400).json({ message: 'New password and confirmation do not match' });
//             }

//             const salt = await bcrypt.genSalt(10);
//             user.password = await bcrypt.hash(newPassword, salt);
//         }

//         await user.save();

//         res.status(200).json({ message: 'Profile updated successfully', user });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

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


export const editUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            phone,
            accountType,
            businessName,
            businessType,
            address,
            city,
            state,
            pincode,
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;
        console.log(req.params, "Paramas")
        console.log("Request file:", req.file);

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        // Handle profile image upload
        if (req.file) {
            // Remove the previous profile image if it exists
            if (user.profileImage) {
                // Construct the correct path for the old profile image
                const oldImagePath = path.join(__dirname, "..", "uploads", "user", path.basename(user.profileImage));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.error("Error deleting old profile image:", err);
                        } else {
                            console.log("Old profile image deleted successfully");
                        }
                    });
                } else {
                    console.log("Old profile image does not exist:", oldImagePath);
                }
            }

            // Set the new profile image
            user.profileImage = `/uploads/user/${req.file.filename}`;
        }

        // Update basic user fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;
        user.accountType = accountType || user.accountType;
        user.businessName = accountType === "business" ? businessName : null;
        user.businessType = accountType === "business" ? businessType : null;
        user.address = address || user.address;
        user.city = city || user.city;
        user.state = state || user.state;
        user.pincode = pincode || user.pincode;

        // Handle password update
        if (currentPassword || newPassword || confirmPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: "New password and confirmation do not match" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Save the updated user to the database
        await user.save();

        // Return the updated user (excluding the password)
        const updatedUser = await User.findById(userId).select("-password");
        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getWithdraHistory = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).select("withdrawalHistory");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Withdrawal history fetched successfully",
            withdrawalHistory: user.withdrawalHistory || [],
        });
    } catch (error) {
        console.error("Error fetching withdrawal history:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}
export const withdrawRequest = async (req, res) => {
    const { amount, upiid } = req.body;
    const { userId } = req.params;
    console.log(amount, userId, "Amount and User ID for withdrawal request");
    try {
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (amount <= 0 || amount > user.referralAmount) {
            return res.status(400).json({ message: "Invalid withdrawal amount" });
        }
        // Create a withdrawal request
        const withdrawalRequest = {
            amount,
            upiId: upiid,
            status: 'pending',
            requestedAt: new Date(),
        };
        user.withdrawalRequests.push(withdrawalRequest);
        user.referralAmount -= amount; // Deduct the amount from the user's referral balance

        await user.save();
        res.status(200).json({
            message: "Withdrawal request submitted successfully",
            withdrawalRequest,
            availableAmount: user.referralAmount // Return the updated referral amount
        });

    } catch (error) {
        console.error("Error processing withdrawal request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateWithdrawalStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { requestId, status, transactionId, adminNote } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const withdrawal = user.withdrawalRequests.id(requestId);
        if (!withdrawal) {
            return res.status(404).json({ message: "Withdrawal request not found" });
        }

        // 🚫 Prevent multiple updates if already finalized
        if (["rejected", "paid"].includes(withdrawal.status)) {
            return res.status(400).json({
                message: `This withdrawal has already been ${withdrawal.status} and cannot be updated again.`,
                withdrawal,
            });
        }

        if (status === "approved") {
            withdrawal.status = "approved"; // just approve, money already deducted
            withdrawal.adminNote = adminNote || withdrawal.adminNote;
            withdrawal.processedDate = new Date();
        }
        else if (status === "paid") {
            withdrawal.status = "paid";
            withdrawal.transactionId = transactionId || withdrawal.transactionId;
            withdrawal.adminNote = adminNote || withdrawal.adminNote;
            withdrawal.processedDate = new Date();

            // finalize withdrawal (add to totalWithdrawn)
            user.totalWithdrawn += withdrawal.amount;
        }
        else if (status === "rejected") {
            withdrawal.status = "rejected";
            withdrawal.adminNote = adminNote || withdrawal.adminNote;
            withdrawal.processedDate = new Date();

            // rollback: return money to referralAmount only once
            user.referralAmount += withdrawal.amount;

            // keep transaction details but set effective amount to 0 (voided)

        }

        await user.save();

        res.status(200).json({
            message: "Withdrawal request updated successfully",
            withdrawal,
            availableAmount: user.referralAmount,
            totalWithdrawn: user.totalWithdrawn,
        });
    } catch (error) {
        console.error("Error updating withdrawal request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const updateUserStatus = async (req, res) => {
    const { status } = req.body;
    const { userId } = req.params;
    console.log(status, userId, "New Status and User ID for update");
    try {
        const user = await User.findById(userId);
        console.log(user, "User found for status update");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.status = status;
        await user.save();
        res.status(200).json({
            message: "User status updated successfully",
        });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}