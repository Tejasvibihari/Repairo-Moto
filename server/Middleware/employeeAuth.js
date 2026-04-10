
import Employee from '../Models/employeeModel.js';
import jwt from 'jsonwebtoken';
export const authenticateEmployee = async (req, res, next) => {
    try {
     
        // Get token from Authorization header (Bearer token)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token missing or malformed'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.EMPLOYEE_JWT_SECRET);

        // Find employee by id, exclude password field
        const employee = await Employee.findById(decoded.id).select('-password');
        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Attach employee to request object
        req.employee = employee;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};