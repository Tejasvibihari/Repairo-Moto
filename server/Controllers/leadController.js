import Lead from "../Models/leadModel.js";

// ─────────────────────────────────────────────────────────────
// CREATE LEAD
// ─────────────────────────────────────────────────────────────
export const createLead = async (req, res) => {
    try {
        const {
            customer,
            vehicle,
            location,
            source,
            serviceInterest,
            status,
            remarks,
            followUp,
        } = req.body;

        // Validate customer
        if (!customer?.name) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required.",
            });
        }

        if (!customer?.phone) {
            return res.status(400).json({
                success: false,
                message: "Customer phone number is required.",
            });
        }

        // Get lead creator from authenticated user
        const leadBy = req.user?.leadBy;

        if (!leadBy) {
            return res.status(401).json({
                success: false,
                message: "Unable to determine lead creator.",
            });
        }

        const lead = await Lead.create({
            customer,
            vehicle,
            location,
            source: source || "other",
            serviceInterest,
            status: status || "new",
            remarks: remarks || [],
            leadBy,
            followUp,
        });

        return res.status(201).json({
            success: true,
            message: "Lead created successfully.",
            data: lead,
        });
    } catch (error) {
        console.error("Create Lead Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create lead.",
            error: error.message,
        });
    }
};


// ─────────────────────────────────────────────────────────────
// UPDATE LEAD
// ─────────────────────────────────────────────────────────────
export const updateLead = async (req, res) => {
    try {
        const { id } = req.params;

        const lead = await Lead.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found.",
            });
        }

        const {
            customer,
            vehicle,
            location,
            source,
            serviceInterest,
            status,
            remarks,
            followUp,
        } = req.body;

        // Update customer
        if (customer !== undefined) {
            lead.customer = {
                ...lead.customer?.toObject?.(),
                ...customer,
            };
        }

        // Update vehicle
        if (vehicle !== undefined) {
            lead.vehicle = {
                ...lead.vehicle?.toObject?.(),
                ...vehicle,
            };
        }

        // Update location
        if (location !== undefined) {
            lead.location = {
                ...lead.location?.toObject?.(),
                ...location,
            };
        }

        if (source !== undefined) {
            lead.source = source;
        }

        if (serviceInterest !== undefined) {
            lead.serviceInterest = serviceInterest;
        }

        if (status !== undefined) {
            lead.status = status;
        }

        if (remarks !== undefined) {
            lead.remarks = remarks;
        }

        if (followUp !== undefined) {
            lead.followUp = followUp;
        }

        // NOTE:
        // leadBy is intentionally NOT updated.
        // It represents the original lead creator.

        await lead.save();

        return res.status(200).json({
            success: true,
            message: "Lead updated successfully.",
            data: lead,
        });
    } catch (error) {
        console.error("Update Lead Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update lead.",
            error: error.message,
        });
    }
};


// ─────────────────────────────────────────────────────────────
// GET SINGLE LEAD
// ─────────────────────────────────────────────────────────────
export const getLead = async (req, res) => {
    try {
        const { id } = req.params;

        const lead = await Lead.findOne({
            _id: id,
            isDeleted: false,
        }).lean();

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: lead,
        });
    } catch (error) {
        console.error("Get Lead Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch lead.",
            error: error.message,
        });
    }
};


// ─────────────────────────────────────────────────────────────
// GET ALL LEADS
// Search + Filter + Pagination + Sorting
// ─────────────────────────────────────────────────────────────
export const getAllLeads = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 20,
            search,
            status,
            source,
            serviceInterest,
            leadBy,
            startDate,
            endDate,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        // Pagination
        page = Math.max(parseInt(page, 10) || 1, 1);

        limit = Math.min(
            Math.max(parseInt(limit, 10) || 20, 1),
            100
        );

        const skip = (page - 1) * limit;

        // ─────────────────────────────────────────────
        // Base filter
        // ─────────────────────────────────────────────
        const filter = {
            isDeleted: false,
        };

        // ─────────────────────────────────────────────
        // Search
        // ─────────────────────────────────────────────
        if (search?.trim()) {
            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            filter.$or = [
                { "customer.name": searchRegex },
                { "customer.phone": searchRegex },

                { "vehicle.brand": searchRegex },
                { "vehicle.model": searchRegex },
                {
                    "vehicle.registrationNumber":
                        searchRegex,
                },

                { "location.address": searchRegex },
                { "location.city": searchRegex },

                { source: searchRegex },
                { serviceInterest: searchRegex },
                { leadBy: searchRegex },
            ];
        }

        // ─────────────────────────────────────────────
        // Status filter
        // ─────────────────────────────────────────────
        if (status) {
            filter.status = status;
        }

        // ─────────────────────────────────────────────
        // Source filter
        // ─────────────────────────────────────────────
        if (source) {
            filter.source = source;
        }

        // ─────────────────────────────────────────────
        // Service filter
        // ─────────────────────────────────────────────
        if (serviceInterest?.trim()) {
            filter.serviceInterest = new RegExp(
                serviceInterest.trim(),
                "i"
            );
        }

        // ─────────────────────────────────────────────
        // Lead creator filter
        // ─────────────────────────────────────────────
        if (leadBy?.trim()) {
            filter.leadBy = new RegExp(
                leadBy.trim(),
                "i"
            );
        }

        // ─────────────────────────────────────────────
        // Date filter
        // ─────────────────────────────────────────────
        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                const start = new Date(startDate);

                if (!isNaN(start.getTime())) {
                    start.setHours(0, 0, 0, 0);
                    filter.createdAt.$gte = start;
                }
            }

            if (endDate) {
                const end = new Date(endDate);

                if (!isNaN(end.getTime())) {
                    end.setHours(23, 59, 59, 999);
                    filter.createdAt.$lte = end;
                }
            }

            if (
                Object.keys(filter.createdAt).length === 0
            ) {
                delete filter.createdAt;
            }
        }

        // ─────────────────────────────────────────────
        // Allowed sort fields
        // ─────────────────────────────────────────────
        const allowedSortFields = [
            "createdAt",
            "updatedAt",
            "customer.name",
            "status",
            "source",
            "leadBy",
        ];

        if (!allowedSortFields.includes(sortBy)) {
            sortBy = "createdAt";
        }

        sortOrder =
            sortOrder === "asc"
                ? 1
                : -1;

        const sort = {
            [sortBy]: sortOrder,

            // If two leads have same createdAt,
            // newer ObjectId comes first.
            _id: -1,
        };

        // ─────────────────────────────────────────────
        // Fetch leads + total
        // ─────────────────────────────────────────────
        const [leads, total] = await Promise.all([
            Lead.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),

            Lead.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            data: leads,

            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },

            filters: {
                search: search || null,
                status: status || null,
                source: source || null,
                serviceInterest:
                    serviceInterest || null,
                leadBy: leadBy || null,
                startDate: startDate || null,
                endDate: endDate || null,
                sortBy,
                sortOrder:
                    sortOrder === 1
                        ? "asc"
                        : "desc",
            },
        });
    } catch (error) {
        console.error("Get All Leads Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch leads.",
            error: error.message,
        });
    }
};


// ─────────────────────────────────────────────────────────────
// DELETE LEAD
//
// No invoice linked  → Permanent delete
// Invoice linked     → Soft delete
// ─────────────────────────────────────────────────────────────
export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;

        const lead = await Lead.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found.",
            });
        }

        // Check whether invoice is linked
        const hasLinkedInvoice =
            lead.invoice?.linked === true &&
            !!lead.invoice?.invoiceId;

        // ─────────────────────────────────────────────
        // Invoice linked → Soft delete
        // ─────────────────────────────────────────────
        if (hasLinkedInvoice) {
            lead.isDeleted = true;
            lead.deletedAt = new Date();

            await lead.save();

            return res.status(200).json({
                success: true,
                message:
                    "Lead has a linked invoice and was soft deleted.",
                data: {
                    leadId: lead._id,
                    softDeleted: true,
                    deletedAt: lead.deletedAt,
                },
            });
        }

        // ─────────────────────────────────────────────
        // No invoice → Permanent delete
        // ─────────────────────────────────────────────
        await Lead.deleteOne({
            _id: lead._id,
        });

        return res.status(200).json({
            success: true,
            message: "Lead permanently deleted.",
            data: {
                leadId: lead._id,
                softDeleted: false,
            },
        });
    } catch (error) {
        console.error("Delete Lead Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete lead.",
            error: error.message,
        });
    }
};