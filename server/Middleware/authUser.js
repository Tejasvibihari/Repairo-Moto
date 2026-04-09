import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';


const authUser = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user; // attach admin to request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token Please Login Again' });
    }
};

export default authUser;
