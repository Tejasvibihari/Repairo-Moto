import express from 'express';
import {
    createManualInvoice,
    updateManualInvoice,
    deleteManualInvoice,
    getManualInvoiceById,
    getAllManualInvoices,
} from '../Controllers/manualInvoiceController.js';
import authAdmin from '../Middleware/authAdmin.js';

const router = express.Router();

// authAdmin accepts admin tokens plus employees with the positions
// telecaller / manager / operational manager (see Middleware/authAdmin.js).
// It sets req.user.role to 'Admin' or 'Employee'.
const adminOnly = (req, res, next) => {
    if (req.user?.role === 'Admin') return next();
    return res.status(403).json({
        success: false,
        message: 'Admin access required',
    });
};

// Every manual-invoice route requires a valid token
router.use(authAdmin);

// Create a new manual invoice (admin only)
router.post('/', adminOnly, createManualInvoice);

// Get all manual invoices (admin only)
router.get('/', adminOnly, getAllManualInvoices);

// Get a single manual invoice by ID.
// Staff (e.g. telecallers) can open the invoice linked to one of their leads.
router.get('/:id', getManualInvoiceById);

// Update a manual invoice by ID (admin only)
router.put('/:id', adminOnly, updateManualInvoice);

// Delete a manual invoice by ID (admin only)
router.delete('/:id', adminOnly, deleteManualInvoice);

export default router;
