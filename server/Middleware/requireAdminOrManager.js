// Allow the read-only staff overview to admins and operational managers.
const requireAdminOrManager = (req, res, next) => {
    const position = String(req.user?.position || '').trim().toLowerCase().replace(/_/g, ' ');
    if (req.user?.role === 'Admin' || ['manager', 'operational manager', 'ops manager'].includes(position)) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Admin or manager access required.',
    });
};

export default requireAdminOrManager;
