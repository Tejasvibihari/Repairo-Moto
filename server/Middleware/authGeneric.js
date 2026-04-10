import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import Employee from '../Models/employeeModel.js';
import Admin from '../Models/adminModel.js';
import Vendor from '../Models/vendorModel.js';

/**
 * Generic authentication middleware that works for ANY role
 * (User, Employee, Admin, Vendor).
 * Sets req.user = { _id, role, model }
 */
const authGeneric = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        let decoded = null;
        const secrets = [
            process.env.ADMIN_JWT_SECRET,
            process.env.EMPLOYEE_JWT_SECRET,
            process.env.VENDOR_JWT_SECRET,
            process.env.USER_JWT_SECRET
        ].filter(Boolean);

        for (const secret of secrets) {
            try {
                decoded = jwt.verify(token, secret);
                if (decoded) break;
            } catch (e) {
                // Continue to next secret
            }
        }

        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Invalid token or unauthorized' });
        }

        // Try User model
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
            req.user = {
                _id: user._id,
                role: 'user',
                model: 'User'
            };
            return next();
        }

        // Try Employee model
        const employee = await Employee.findById(decoded.id).select('-password');
        if (employee) {
            req.user = {
                _id: employee._id,
                role: employee.position || 'employee',
                model: 'Employee'
            };
            return next();
        }

        // Try Admin model
        const admin = await Admin.findById(decoded.id).select('-password');
        if (admin) {
            req.user = {
                _id: admin._id,
                role: 'admin',
                model: 'Admin'
            };
            return next();
        }

        // Try Vendor model
        const vendor = await Vendor.findById(decoded.id).select('-password');
        if (vendor) {
            req.user = {
                _id: vendor._id,
                role: 'vendor',
                model: 'Vendor'
            };
            return next();
        }

        return res.status(401).json({ message: 'User not found' });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
};

export default authGeneric;
