import Admin from '../Models/adminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js'
import Vendor from '../Models/vendorModel.js';
import { sendMail } from '../Utils/mailer.js';
import crypto from 'crypto';
import { log } from 'console';



// Admin SignUp Controller
export const adminSignUp = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            firstName,
            lastName,
            email,
            password: hashPassword,
        });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
// Admin SignIn Controller
export const adminSignIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Email' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.ADMIN_JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Admin SignOut Controller
export const signOut = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const forgotPassword = async (req, res) => {
    const { email, userType } = req.body;

    try {
        let user;

        if (userType === 'Admin') {
            user = await Admin.findOne({ email });
        } else if (userType === 'User') {
            user = await User.findOne({ email });
        } else if (userType === 'Employee') {
            user = await Employee.findOne({ email });
        } else if (userType === 'Vendor') {
            user = await Vendor.findOne({ email });
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        if (!user) {
            return res.status(404).json({ message: `${userType} not found` });
        }

        // Generate secure token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash the token before saving for security
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Store hashed token and expiry in DB
        user.otp = hashedToken;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry
        await user.save();

        // Create reset link (Frontend U    RL for password reset page)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${userType}/${resetToken}`;
        console.log(resetLink)
        // Send email
        try {
            await sendMail({
                to: user.email,
                subject: 'Password Reset Link',
                body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - Secure Your Account</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800&family=Roboto:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            color: #292929;
            line大批: 1.6;
        }

        .email-wrapper {
            width: 100%;
            padding: 40px 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .container {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
            position: relative;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #e2a731 0%, #78dcca 100%);
        }

        .header {
            background: linear-gradient(135deg, #e2a731 0%, #f4c245 100%);
            padding: 50px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
        }

        .header-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: rgb(255, 255, 255);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .header-icon img {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }

        .header h1 {
            margin: 0;
            font-size: 32px;
            color: #ffffff;
            font-weight: 800;
            font-family: 'Nunito', sans-serif;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
        }

        .header p {
            margin: 10px 0 0;
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }

        .content {
            padding: 60px 40px;
            text-align: center;
            background: #ffffff;
        }

        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #292929;
            margin: 0 0 30px;
            font-family: 'Nunito', sans-serif;
        }

        .message {
            font-size: 18px;
            line-height: 1.8;
            color: #64748b;
            margin: 0 0 40px;
            max-width: 480px;
            margin-left: auto;
            margin-right: auto;
        }

        .cta-section {
            margin: 50px 0;
        }

        .reset-button {
            display: inline-block;
            padding: 18px 40px;
            background: linear-gradient(135deg, #e2a731 0%, #f4c245 100%);
            color: #ffffff;
            text-decoration: none;
            font-size: 18px;
            font-weight: 700;
            border-radius: 50px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 25px rgba(226, 167, 49, 0.3);
            position: relative;
            overflow: hidden;
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .reset-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .reset-button:hover::before {
            left: 100%;
        }

        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(226, 167, 49, 0.4);
        }

        .timer-info {
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-radius: 15px;
            border-left: 4px solid #78dcca;
        }

        .timer-info p {
            margin: 0;
            color: #292929;
            font-size: 16px;
            font-weight: 600;
        }

        .timer-info .time {
            color: #78dcca;
            font-weight: 700;
            font-size: 18px;
        }

        .fallback {
            margin-top: 40px;
            padding: 30px;
            background: #f8fafc;
            border-radius: 15px;
            border: 2px dashed #cbd5e1;
        }

        .fallback p {
            margin: 0 0 15px;
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
        }

        .fallback-link {
            color: #78dcca;
            text-decoration: none;
            word-break: break-all;
            font-weight: 600;
            padding: 10px;
            background: rgba(120, 220, 202, 0.1);
            border-radius: 8px;
            display: inline-block;
            transition: all 0.3s ease;
        }

        .fallback-link:hover {
            background: rgba(120, 220, 202, 0.2);
            transform: translateY(-1px);
        }

        .security-tips {
            margin-top: 50px;
            text-align: left;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
        }

        .security-tips h3 {
            color: #292929;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 20px;
            text-align: center;
            font-family: 'Nunito', sans-serif;
        }

        .tip-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .tip-icon {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            margin-top: 2px;
            flex-shrink: 0;
        }

        .tip-icon svg {
            width: 100%;
            height: 100%;
            fill: #78dcca;
        }

        .tip-text {
            font-size: 14px;
            color: #64748b;
            line-height: 1.6;
        }

        .footer {
            background: #292929;
            padding: 40px 30px;
            text-align: center;
            color: #ffffff;
        }

        .footer-content {
            max-width: 500px;
            margin: 0 auto;
        }

        .company-name {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 15px;
            font-family: 'Nunito', sans-serif;
        }

        .footer-text {
            font-size: 14px;
            color: #94a3b8;
            margin: 0 0 20px;
            line-height: 1.6;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-link {
            display: inline-block;
            width: 40px;
            height: 40px;
            margin: 0 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .social-link:hover {
            background: #e2a731;
            transform: translateY(-2px);
        }

        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            
            .container {
                border-radius: 15px;
            }
            
            .header {
                padding: 40px 20px;
            }
            
            .header h1 {
                font-size: 26px;
            }
            
            .content {
                padding: 40px 25px;
            }
            
            .greeting {
                font-size: 20px;
            }
            
            .message {
                font-size: 16px;
            }
            
            .reset-button {
                padding: 16px 32px;
                font-size: 16px;
            }
            
            .security-tips {
                text-align: left;
                margin-top: 40px;
            }
            
            .footer {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="header">
                <div class="header-icon">
                    <img src="https://repairomoto.in/logo/logo72.png" alt="Repairo Moto Logo" />
                </div>
                <h1>Password Reset</h1>
                <p>Secure your account with a new password</p>
            </div>
            
            <div class="content">
                <h2 class="greeting">Hello there! 👋</h2>
                
                <p class="message">
                    We received a request to reset your password. No worries – it happens to the best of us! 
                    Click the button below to create a new secure password and regain access to your account.
                </p>
                
                <div class="cta-section">
                    <a href="${resetLink}" class="reset-button">
                        Reset My Password
                    </a>
                </div>
                
                <div class="timer-info">
                    <p>⏰ This link expires in <span class="time">10 minutes</span> for your security</p>
                </div>
                
                <div class="fallback">
                    <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                    <a href="${resetLink}" class="fallback-link">${resetLink}</a>
                </div>
                
                <div class="security-tips">
                    <h3>🔒 Security Tips</h3>
                    <div class="tip-item">
                        <div class="tip-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M9,20.42l-6.21-6.21,2.83-2.83L9,14.77l9.88-9.89,2.83,2.83L9,20.42Z"/>
                            </svg>
                        </div>
                        <div class="tip-text">Use a strong password with at least 8 characters</div>
                    </div>
                    <div class="tip-item">
                        <div class="tip-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M9,20.42l-6.21-6.21,2.83-2.83L9,14.77l9.88-9.89,2.83,2.83L9,20.42Z"/>
                            </svg>
                        </div>
                        <div class="tip-text">Include numbers, symbols, and mixed case letters</div>
                    </div>
                    <div class="tip-item">
                        <div class="tip-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M9,20.42l-6.21-6.21,2.83-2.83L9,14.77l9.88-9.89,2.83,2.83L9,20.42Z"/>
                            </svg>
                        </div>
                        <div class="tip-text">Never share your password with anyone</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-content">
                    <div class="company-name">Repairo Moto</div>
                    <p class="footer-text">
                        If you didn't request this password reset, please ignore this email or contact our support team. 
                        Your account security is our top priority.
                    </p>
                    <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
                        © 2025 Repairo Moto. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
            });
            console.log(`Password reset link sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending reset link email:', error);
            return res.status(500).json({ message: 'Failed to send password reset email' });
        }

        res.status(200).json({ message: 'Password reset link sent to your email' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req, res) => {
    const { userType, token } = req.params;
    const { password } = req.body;
    console.log(userType)
    console.log("hello")
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        let Model;
        if (userType === "Admin") Model = Admin;
        else if (userType === "User") Model = User;
        else if (userType === "Employee") Model = Employee;
        else if (userType === "Vendor") Model = Vendor;
        else return res.status(400).json({ message: "Invalid user type" });

        // Hash token to match stored hash
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with matching token and unexpired link
        const user = await Model.findOne({
            otp: hashedToken,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash new password
        console.log(password)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        console.log(user.password)
        // Clear reset fields
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();
        console.log(user)
        res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};