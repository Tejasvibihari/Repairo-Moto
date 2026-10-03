// Use AFTER authAdmin. authAdmin lets admins AND some employees through
// (telecaller / manager / operational manager); this narrows to real admins.
const requireAdminRole = (req, res, next) => {
    if (req.user?.role === 'Admin') return next();
    return res.status(403).json({
        success: false,
        message: 'Admin access required.',
    });
};

export default requireAdminRole;
