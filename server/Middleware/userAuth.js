import jwt from 'jsonwebtoken';
import Admin from '../Models/adminModel.js';

const authAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await User.findById(decoded.id).select('-password');

        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        req.admin = admin; // attach admin to request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export default authAdmin;
