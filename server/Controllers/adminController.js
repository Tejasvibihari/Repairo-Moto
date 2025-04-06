import Admin from '../Models/adminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';




// Admin SignUp Controller
export const signUp = async (req, res) => {
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
export const signIn = async (req, res) => {
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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
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