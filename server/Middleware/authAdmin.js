import jwt from 'jsonwebtoken';
import Admin from '../Models/adminModel.js';
import Employee from '../Models/employeeModel.js';


const authAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

        // Check Admin
        const admin = await Admin.findById(decoded.id).select('-password');

        if (admin) {
            req.user = {
                _id: admin._id,
                role: 'Admin',
                model: 'User'
            };
            return next();
        }

        // Check Employee
        const employee = await Employee.findById(decoded.id).select('-password');

        if (employee) {
            if (employee.position === 'telecaller' || employee.position === 'operational manager') {
                req.user = {
                    _id: employee._id,
                    role: 'Employee',
                    model: 'Employee'
                };
                return next();
            } else {
                return res.status(403).json({ message: 'Unauthorized employee role' });
            }
        }

        return res.status(401).json({ message: 'User not found' });

    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Token expired or invalid' });
    }
};

export default authAdmin;