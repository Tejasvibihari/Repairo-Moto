import Employee from '../Models/employeeModel.js';
import jwt from 'jsonwebtoken';

export const authenticateEmployee = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith('Bearer ')
        ) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token missing or malformed',
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.EMPLOYEE_JWT_SECRET
        );

        const employee = await Employee.findById(decoded.id)
            .select('-password')
            .lean();

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`
            .trim();

        req.employee = employee;

        req.user = {
            ...employee,

            role: 'Employee',
            model: 'Employee',

            // Name used for Lead.leadBy
            leadBy: fullName || employee.email,
        };

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
            });
        }

        console.error(
            'Employee Auth middleware error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};