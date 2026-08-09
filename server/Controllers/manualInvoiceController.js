import ManualInvoice from '../Models/manualInvoiceModel.js';
import Lead from '../Models/leadModel.js';
// Helper: build filter object from query string
const buildFilter = (query) => {
    const filter = {};

    // Exact matches
    if (query.status) filter.status = query.status;
    if (query.invoiceNumber) filter.invoiceNumber = query.invoiceNumber;

    // Customer name - accepts both customerName and customerDetails.name
    if (query.customerName) {
        filter['customerDetails.name'] = { $regex: query.customerName, $options: 'i' };
    }
    if (query['customerDetails.name']) {
        filter['customerDetails.name'] = query['customerDetails.name'];
    }

    // Customer email
    if (query.customerEmail) {
        filter['customerDetails.email'] = { $regex: query.customerEmail, $options: 'i' };
    }
    if (query['customerDetails.email']) {
        filter['customerDetails.email'] = query['customerDetails.email'];
    }

    // Customer contact
    if (query.customerContact) {
        filter['customerDetails.contactNo'] = { $regex: query.customerContact, $options: 'i' };
    }
    if (query['customerDetails.contactNo']) {
        filter['customerDetails.contactNo'] = query['customerDetails.contactNo'];
    }

    // Vehicle brand - accepts both vehicleBrand and vehicleDetails.brand
    if (query.vehicleBrand) {
        filter['vehicleDetails.brand'] = { $regex: query.vehicleBrand, $options: 'i' };
    }
    if (query['vehicleDetails.brand']) {
        filter['vehicleDetails.brand'] = query['vehicleDetails.brand'];
    }

    // Vehicle model - accepts both vehicleModel and vehicleDetails.model
    if (query.vehicleModel) {
        filter['vehicleDetails.model'] = { $regex: query.vehicleModel, $options: 'i' };
    }
    if (query['vehicleDetails.model']) {
        filter['vehicleDetails.model'] = query['vehicleDetails.model'];
    }

    // Date range (invoiceDate)
    if (query.startDate || query.endDate) {
        filter.invoiceDate = {};
        if (query.startDate) {
            filter.invoiceDate.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
            const endDate = new Date(query.endDate);
            endDate.setHours(23, 59, 59, 999);
            filter.invoiceDate.$lte = endDate;
        }
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

    console.log('Built filter:', JSON.stringify(filter));
    return filter;
};

// Helper: build sort object
const buildSort = (sortBy) => {
    if (!sortBy) return { invoiceDate: -1 }; // default: newest first

    // Handle format: "-field" for descending or "field" for ascending
    let field = sortBy;
    let sortOrder = 1; // ascending by default

    if (sortBy.startsWith('-')) {
        // Remove the '-' prefix and set to descending
        field = sortBy.substring(1);
        sortOrder = -1;
    }

    console.log(`BuildSort: "${sortBy}" → { ${field}: ${sortOrder} }`);
    return { [field]: sortOrder };
};

// ─────────────────────────────────────────────────────────────────
// CREATE invoice
export const createManualInvoice = async (req, res) => {
    try {
        const invoiceData = req.body;
        const { leadId } = invoiceData;

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

        // ─────────────────────────────────────────────
        // 2. Validate Lead if leadId was provided
        // ─────────────────────────────────────────────

        let lead = null;

        if (leadId) {
            lead = await Lead.findOne({
                _id: leadId,
                isDeleted: false,
            });

            if (!lead) {
                return res.status(404).json({
                    message:
                        'Lead not found or lead has been deleted',
                });
            }

            // Prevent linking another invoice to the same lead
            if (
                lead.invoice?.linked &&
                lead.invoice?.invoiceId
            ) {
                return res.status(409).json({
                    message:
                        'This lead is already linked with an invoice',
                    invoiceId:
                        lead.invoice.invoiceId,
                });
            }

            // Store leadId in invoice
            invoiceData.leadId = lead._id;
        } else {
            // Make sure normal invoices explicitly have null
            invoiceData.leadId = null;
        }

        // 3. Payment validation based on status
        const validMethods = ['razorpay', 'upi', 'card', 'bank_transfer', 'referral', 'cash'];
        const status = invoiceData.status || 'paid';

        if (status === 'paid') {
            // For PAID invoices: payment method is required
            if (!invoiceData.paymentDetails?.method) {
                return res.status(400).json({ message: 'Payment method is required for paid invoices' });
            }
            if (!validMethods.includes(invoiceData.paymentDetails.method)) {
                return res.status(400).json({ message: 'Invalid payment method. Valid methods are: ' + validMethods.join(', ') });
            }
            // Amount paid should be provided for paid invoices
            if (!invoiceData.paymentDetails?.amountPaid || invoiceData.paymentDetails.amountPaid <= 0) {
                return res.status(400).json({ message: 'Amount paid must be greater than zero for paid invoices' });
            }
        } else if (status === 'unpaid') {
            // For UNPAID invoices: payment details should be minimal or empty
            // This is optional and can be updated later
            if (!invoiceData.paymentDetails) {
                invoiceData.paymentDetails = {
                    method: 'cash',
                    amountPaid: 0,
                    walletAmountUsed: 0,
                    totalSettled: 0,
                    paymentDate: null,
                };
            }
        }

        // 4. GST rate range validation
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

export const updateManualInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // ─────────────────────────────────────────────
        // 1. Find existing invoice
        // ─────────────────────────────────────────────

        const invoice = await ManualInvoice.findById(id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        // ─────────────────────────────────────────────
        // 2. Prevent duplicate invoice number
        // ─────────────────────────────────────────────

        if (updates.invoiceNumber) {
            const existing = await ManualInvoice.findOne({
                invoiceNumber: updates.invoiceNumber,
                _id: { $ne: id },
            });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: 'Invoice number already in use',
                });
            }
        }

        // ─────────────────────────────────────────────
        // 3. Validate payment details
        // ─────────────────────────────────────────────

        if (updates.status || updates.paymentDetails) {
            const validMethods = [
                'razorpay',
                'upi',
                'card',
                'bank_transfer',
                'referral',
                'cash',
            ];

            const status =
                updates.status || invoice.status || 'paid';

            if (status === 'paid') {
                const paymentDetails =
                    updates.paymentDetails ||
                    invoice.paymentDetails ||
                    {};

                if (!paymentDetails.method) {
                    return res.status(400).json({
                        success: false,
                        message:
                            'Payment method is required for paid invoices',
                    });
                }

                if (
                    !validMethods.includes(
                        paymentDetails.method
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            'Invalid payment method. Valid methods are: ' +
                            validMethods.join(', '),
                    });
                }

                if (
                    !paymentDetails.amountPaid ||
                    paymentDetails.amountPaid <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            'Amount paid must be greater than zero for paid invoices',
                    });
                }
            }
        }

        // ─────────────────────────────────────────────
        // 4. Lead association handling
        // ─────────────────────────────────────────────

        const leadIdWasProvided =
            Object.prototype.hasOwnProperty.call(
                updates,
                'leadId'
            );

        const oldLeadId = invoice.leadId
            ? invoice.leadId.toString()
            : null;

        let newLeadId = null;

        if (leadIdWasProvided) {
            /*
             * Three possibilities:
             *
             * leadId not provided
             *     → do nothing
             *
             * leadId: null
             *     → remove association
             *
             * leadId: "xxxxx"
             *     → associate with new lead
             */

            if (
                updates.leadId !== null &&
                updates.leadId !== ''
            ) {
                newLeadId =
                    updates.leadId.toString();
            }

            // ─────────────────────────────────────────
            // Case 1:
            // Remove lead association
            // ─────────────────────────────────────────

            if (!newLeadId) {
                if (oldLeadId) {
                    const oldLead =
                        await Lead.findById(oldLeadId);

                    if (oldLead) {
                        oldLead.invoice = {
                            linked: false,
                            invoiceId: null,
                            linkedAt: null,
                        };

                        /*
                         * The invoice is no longer associated
                         * with this lead.
                         *
                         * Don't mark it as booked anymore.
                         */
                        if (
                            oldLead.status === 'booked'
                        ) {
                            oldLead.status = 'interested';
                        }

                        await oldLead.save();
                    }
                }

                updates.leadId = null;
            }

            // ─────────────────────────────────────────
            // Case 2:
            // Associate with another lead
            // ─────────────────────────────────────────

            else {
                const newLead =
                    await Lead.findOne({
                        _id: newLeadId,
                        isDeleted: false,
                    });

                if (!newLead) {
                    return res.status(404).json({
                        success: false,
                        message:
                            'New lead not found or lead has been deleted',
                    });
                }

                /*
                 * Don't allow two invoices to point
                 * to the same lead.
                 */
                const existingInvoice =
                    await ManualInvoice.findOne({
                        leadId: newLead._id,
                        _id: { $ne: invoice._id },
                    }).select('_id invoiceNumber');

                if (existingInvoice) {
                    return res.status(409).json({
                        success: false,
                        message:
                            'This lead is already associated with another invoice',
                        invoiceId:
                            existingInvoice._id,
                        invoiceNumber:
                            existingInvoice.invoiceNumber,
                    });
                }

                // ─────────────────────────────────────
                // Remove old lead association
                // ─────────────────────────────────────

                if (
                    oldLeadId &&
                    oldLeadId !== newLeadId
                ) {
                    const oldLead =
                        await Lead.findById(oldLeadId);

                    if (oldLead) {
                        oldLead.invoice = {
                            linked: false,
                            invoiceId: null,
                            linkedAt: null,
                        };

                        if (
                            oldLead.status === 'booked'
                        ) {
                            oldLead.status = 'interested';
                        }

                        await oldLead.save();
                    }
                }

                // ─────────────────────────────────────
                // Associate new lead
                // ─────────────────────────────────────

                newLead.invoice = {
                    linked: true,
                    invoiceId: invoice._id,
                    linkedAt: new Date(),
                };

                newLead.status = 'booked';

                await newLead.save();

                updates.leadId = newLead._id;
            }
        }

        // ─────────────────────────────────────────────
        // 5. Apply invoice updates
        // ─────────────────────────────────────────────

        Object.keys(updates).forEach((key) => {
            invoice[key] = updates[key];
        });

        await invoice.save();

        // ─────────────────────────────────────────────
        // 6. Response
        // ─────────────────────────────────────────────

        return res.status(200).json({
            success: true,
            message: leadIdWasProvided
                ? newLeadId
                    ? 'Invoice and lead association updated successfully'
                    : 'Invoice lead association removed successfully'
                : 'Invoice updated successfully',

            data: invoice,
        });

    } catch (error) {
        console.error(
            'Update Manual Invoice Error:',
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    'Invoice number already exists',
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ─────────────────────────────────────────────────────────────────
// DELETE invoice by ID
export const deleteManualInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find invoice first
        const invoice = await ManualInvoice.findById(id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        // 2. Remove invoice association from lead
        if (invoice.leadId) {
            const lead = await Lead.findById(invoice.leadId);

            if (lead) {
                lead.invoice = {
                    linked: false,
                    invoiceId: null,
                    linkedAt: null,
                };

                await lead.save();
            }
        }

        // 3. Delete invoice
        await ManualInvoice.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Invoice deleted successfully',
        });

    } catch (error) {
        console.error(
            'Delete Manual Invoice Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
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