import ManualInvoice from '../Models/manualInvoiceModel.js';

// Helper: build filter object from query string
const buildFilter = (query) => {
    const filter = {};

    // Exact matches
    if (query.status) filter.status = query.status;
    if (query.invoiceNumber) filter.invoiceNumber = query.invoiceNumber;
    if (query['customerDetails.name'])
        filter['customerDetails.name'] = query['customerDetails.name'];
    if (query['customerDetails.email'])
        filter['customerDetails.email'] = query['customerDetails.email'];
    if (query['customerDetails.contactNo'])
        filter['customerDetails.contactNo'] = query['customerDetails.contactNo'];
    if (query['vehicleDetails.brand'])
        filter['vehicleDetails.brand'] = query['vehicleDetails.brand'];
    if (query['vehicleDetails.model'])
        filter['vehicleDetails.model'] = query['vehicleDetails.model'];

    // Date range (invoiceDate)
    if (query.startDate || query.endDate) {
        filter.invoiceDate = {};
        if (query.startDate) filter.invoiceDate.$gte = new Date(query.startDate);
        if (query.endDate) filter.invoiceDate.$lte = new Date(query.endDate);
    }

    // Partial text search on customer name / invoice number
    if (query.search) {
        filter.$or = [
            { invoiceNumber: { $regex: query.search, $options: 'i' } },
            { 'customerDetails.name': { $regex: query.search, $options: 'i' } },
            { 'customerDetails.email': { $regex: query.search, $options: 'i' } },
            { 'customerDetails.contactNo': { $regex: query.search, $options: 'i' } },
        ];
    }

    return filter;
};

// Helper: build sort object
const buildSort = (sortBy) => {
    if (!sortBy) return { createdAt: -1 }; // default
    const [field, order] = sortBy.split(':');
    const sortOrder = order === 'asc' ? 1 : -1;
    return { [field]: sortOrder };
};

// ─────────────────────────────────────────────────────────────────
// CREATE invoice
export const createManualInvoice = async (req, res) => {
    try {
        const invoiceData = req.body;

        // 1. Required field validations
        if (!invoiceData.invoiceNumber || typeof invoiceData.invoiceNumber !== 'string') {
            return res.status(400).json({ message: 'Valid invoiceNumber is required' });
        }
        if (!invoiceData.customerDetails?.name || !invoiceData.customerDetails?.contactNo) {
            return res.status(400).json({ message: 'Customer name and contact number are required' });
        }
        const hasParts = invoiceData.partsUsed?.length > 0;
        const hasServices = invoiceData.serviceProvided?.length > 0;
        if (!hasParts && !hasServices) {
            return res.status(400).json({ message: 'At least one part or service must be provided' });
        }
        if (invoiceData.total?.subTotal <= 0) {
            return res.status(400).json({ message: 'Subtotal must be greater than zero' });
        }

        // 2. Payment method validation
        const validMethods = ['razorpay', 'upi', 'card', 'bank_transfer', 'referral', 'cash'];
        if (!validMethods.includes(invoiceData.paymentDetails?.method)) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        // 3. GST rate range validation
        if (invoiceData.total?.sgstRate !== undefined && (invoiceData.total.sgstRate < 0 || invoiceData.total.sgstRate > 100)) {
            return res.status(400).json({ message: 'SGST rate must be between 0 and 100' });
        }
        if (invoiceData.total?.cgstRate !== undefined && (invoiceData.total.cgstRate < 0 || invoiceData.total.cgstRate > 100)) {
            return res.status(400).json({ message: 'CGST rate must be between 0 and 100' });
        }

        // 4. Create invoice
        const invoice = new ManualInvoice(invoiceData);
        await invoice.save();
        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Invoice number already exists' });
        }
        console.error('Invoice creation error:', error);
        res.status(500).json({ message: error.message });
    }
};
// ─────────────────────────────────────────────────────────────────
// UPDATE invoice by ID
export const updateManualInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Prevent changing invoiceNumber to an existing one (optional)
        if (updates.invoiceNumber) {
            const existing = await ManualInvoice.findOne({
                invoiceNumber: updates.invoiceNumber,
                _id: { $ne: id },
            });
            if (existing) {
                return res.status(409).json({ message: 'Invoice number already in use' });
            }
        }

        const invoice = await ManualInvoice.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// DELETE invoice by ID
export const deleteManualInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await ManualInvoice.findByIdAndDelete(id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// GET invoice by ID
export const getManualInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await ManualInvoice.findById(id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// GET all invoices with filtering, sorting & pagination
export const getAllManualInvoices = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            sortBy,
            // filter params
            status,
            startDate,
            endDate,
            search,
            invoiceNumber,
            customerName,
            customerEmail,
            customerContact,
            vehicleBrand,
            vehicleModel,
        } = req.query;

        // Build filter object
        const filter = buildFilter({
            status,
            startDate,
            endDate,
            search,
            invoiceNumber,
            'customerDetails.name': customerName,
            'customerDetails.email': customerEmail,
            'customerDetails.contactNo': customerContact,
            'vehicleDetails.brand': vehicleBrand,
            'vehicleDetails.model': vehicleModel,
        });

        const sort = buildSort(sortBy);
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [invoices, total] = await Promise.all([
            ManualInvoice.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            ManualInvoice.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: invoices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};