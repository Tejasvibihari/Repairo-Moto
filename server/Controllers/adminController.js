import Admin from '../Models/adminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';



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

export const signIn = async (req, res) => {
    
    try {
        
    } catch (error) {
        
    }
}