import jwt from 'jsonwebtoken';
import Admin from '../Models/adminModel.js';
import Employee from '../Models/employeeModel.js';

const authAdminOrEmployee = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

        // First check if Admin
        const admin = await Admin.findById(decoded.id).select('-password');

        if (admin) {
            req.admin = admin; // attach admin
            return next();
        }

        // If not admin, check Employee
        const employee = await Employee.findById(decoded.id).select('-password');

        if (employee) {
            // Check if employee position is allowed
            if (employee.position === 'telecaller' || employee.position === 'operational manager') {
                req.employee = employee; // attach employee
                return next();
            } else {
                return res.status(403).json({ message: 'Access denied. Unauthorized employee role.' });
            }
        }

        return res.status(401).json({ message: 'Access denied. User not found.' });

    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
};

export default authAdminOrEmployee;
