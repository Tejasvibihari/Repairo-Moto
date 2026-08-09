import jwt from 'jsonwebtoken';
import Admin from '../Models/adminModel.js';
import Employee from '../Models/employeeModel.js';

const authAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
    }

    try {
        let decoded = null;

        const secrets = [
            process.env.ADMIN_JWT_SECRET,
            process.env.EMPLOYEE_JWT_SECRET,
        ].filter(Boolean);

        // Try both JWT secrets
        for (const secret of secrets) {
            try {
                decoded = jwt.verify(token, secret);

                if (decoded) {
                    break;
                }
            } catch (err) {
                // Try next secret
            }
        }

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or unauthorized',
            });
        }

        // ─────────────────────────────────────────────
        // Check Admin
        // ─────────────────────────────────────────────

        const admin = await Admin.findById(decoded.id)
            .select('-password')
            .lean();

        if (admin) {
            const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`
                .trim();

            req.user = {
                ...admin,
                role: 'Admin',
                model: 'Admin',

                // Used by Lead
                leadBy: fullName || admin.email,
            };

            return next();
        }

        // ─────────────────────────────────────────────
        // Check Employee
        // ─────────────────────────────────────────────

        const employee = await Employee.findById(decoded.id)
            .select('-password')
            .lean();

        if (employee) {
            const allowedPositions = [
                'telecaller',
                'operational manager',
                'manager',
            ];

            if (!allowedPositions.includes(employee.position)) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized employee role',
                });
            }

            const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`
                .trim();

            req.user = {
                ...employee,
                role: 'Employee',
                model: 'Employee',

                // Used by Lead
                leadBy: fullName || employee.email,
            };

            return next();
        }

        return res.status(401).json({
            success: false,
            message: 'User not found',
        });

    } catch (error) {
        console.error('Authentication error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Token expired or invalid',
        });
    }
};

export default authAdmin;