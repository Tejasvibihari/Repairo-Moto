import express from 'express';
import {
    createManualInvoice,
    updateManualInvoice,
    deleteManualInvoice,
    getManualInvoiceById,
    getAllManualInvoices,
} from '../Controllers/manualInvoiceController.js';

const router = express.Router();

// Create a new manual invoice
router.post('/', createManualInvoice);

// Get all manual invoices (with filters, sorting, pagination)
router.get('/', getAllManualInvoices);

// Get a single manual invoice by ID
router.get('/:id', getManualInvoiceById);

// Update a manual invoice by ID
router.put('/:id', updateManualInvoice);

// Delete a manual invoice by ID
router.delete('/:id', deleteManualInvoice);

export default router;