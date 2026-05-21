import jwt from 'jsonwebtoken';
import Admin from '../Models/adminModel.js';
import Employee from '../Models/employeeModel.js';


const authAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        let decoded = null;
        const secrets = [
            process.env.ADMIN_JWT_SECRET,
            process.env.EMPLOYEE_JWT_SECRET
        ].filter(Boolean);

        for (const secret of secrets) {
            try {
                decoded = jwt.verify(token, secret);
                if (decoded) break;
            } catch (err) {
                // Keep trying
            }
        }

        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Invalid token or unauthorized' });
        }

        // Check Admin
        const admin = await Admin.findById(decoded.id).select('-password');

        if (admin) {

            req.user = admin.toObject();
            req.user.role = 'Admin';
            req.user.model = 'Admin';
            return next();
        }

        // Check Employee
        const employee = await Employee.findById(decoded.id).select('-password');

        if (employee) {
            if (employee.position === 'telecaller' || employee.position === 'operational manager' || employee.position === 'manager') {

                req.user = employee.toObject();
                req.user.role = 'Employee';
                req.user.model = 'Employee';
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