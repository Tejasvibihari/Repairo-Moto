import Lead from "../Models/leadModel.js";
import Employee from "../Models/employeeModel.js";
import {
    RANGES,
    endOfToday,
    escapeRegex,
    exactNameRegex,
    isTelecallerUser,
    ownershipFilter,
    resolveRange,
    startOfToday,
} from "../Utils/leadHelpers.js";

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
            leadById: req.user?._id || null,
            leadByModel: req.user?.model || null,
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
            ...ownershipFilter(req.user),
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
            ...ownershipFilter(req.user),
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
            hasInvoice,
            range,
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

        // Telecallers are always restricted to their own leads,
        // whatever `leadBy` they pass in the query string.
        const telecaller = isTelecallerUser(req.user);
        if (telecaller) {
            filter.leadBy = req.user.leadBy;
        }

        // ─────────────────────────────────────────────
        // Search
        // ─────────────────────────────────────────────
        if (search?.trim()) {
            const searchRegex = new RegExp(
                escapeRegex(search.trim()),
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
            filter.serviceInterest = serviceInterest.trim();
        }

        // ─────────────────────────────────────────────
        // Invoice filter (hasInvoice=false → only leads that can still
        // be linked to an invoice, true → only already-linked leads)
        // ─────────────────────────────────────────────
        if (hasInvoice === "false") {
            filter["invoice.linked"] = { $ne: true };
        } else if (hasInvoice === "true") {
            filter["invoice.linked"] = true;
        }

        // ─────────────────────────────────────────────
        // Lead creator filter
        // ─────────────────────────────────────────────
        // (ignored for telecallers — already pinned above)
        if (!telecaller && leadBy?.trim()) {
            filter.leadBy = exactNameRegex(leadBy);
        }

        // ─────────────────────────────────────────────
        // Date filter
        // ─────────────────────────────────────────────
        const ranged = resolveRange(range);
        if (ranged.start || ranged.end) {
            // `range` (today / 7d / 30d) wins over startDate / endDate
            filter.createdAt = {};
            if (ranged.start) filter.createdAt.$gte = ranged.start;
            if (ranged.end) filter.createdAt.$lte = ranged.end;
        } else if (startDate || endDate) {
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
            ...ownershipFilter(req.user),
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


// ─────────────────────────────────────────────────────────────
// ADMIN: LEADS OVERVIEW (per-telecaller performance)
//
// GET /api/lead/overview?range=today|7d|30d|all
//
// Groups every non-deleted lead in the range by who created it
// (`leadBy`) and returns counts per status plus follow-up /
// invoice figures. Telecallers with zero leads in the range are
// still listed so the admin can spot inactivity.
//
// "Converted" = status booked or completed.
// ─────────────────────────────────────────────────────────────
const CONVERTED_STATUSES = ["booked", "completed"];

const pct = (part, whole) =>
    whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

export const getLeadOverview = async (req, res) => {
    try {
        const range = RANGES.includes(req.query.range)
            ? req.query.range
            : "all";
        const { start, end } = resolveRange(range);

        const match = { isDeleted: false };
        if (start) match.createdAt = { $gte: start, $lte: end };

        const now = new Date();
        const todayStart = startOfToday(now);
        const todayEnd = endOfToday(now);

        const hasFollowUpDate = {
            $eq: [{ $type: "$followUp.date" }, "date"],
        };
        const isFollowUpStatus = { $eq: ["$status", "follow_up"] };

        const [statusRows, metricRows, telecallers] = await Promise.all([
            Lead.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { leadBy: "$leadBy", status: "$status" },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Lead.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$leadBy",
                        leadById: { $max: "$leadById" },
                        leadByModel: { $max: "$leadByModel" },
                        total: { $sum: 1 },
                        createdToday: {
                            $sum: {
                                $cond: [{ $gte: ["$createdAt", todayStart] }, 1, 0],
                            },
                        },
                        followUpsToday: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            isFollowUpStatus,
                                            hasFollowUpDate,
                                            { $gte: ["$followUp.date", todayStart] },
                                            { $lte: ["$followUp.date", todayEnd] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        overdueFollowUps: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            isFollowUpStatus,
                                            hasFollowUpDate,
                                            { $lt: ["$followUp.date", now] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        invoicesLinked: {
                            $sum: { $cond: [{ $eq: ["$invoice.linked", true] }, 1, 0] },
                        },
                        lastActivityAt: { $max: "$updatedAt" },
                    },
                },
            ]),
            Employee.find({ position: "telecaller" })
                .select("firstName lastName email position profileImage")
                .lean(),
        ]);

        // status counts per creator
        const statusByCreator = new Map();
        for (const r of statusRows) {
            const key = r._id.leadBy;
            if (!statusByCreator.has(key)) statusByCreator.set(key, {});
            statusByCreator.get(key)[r._id.status] = r.count;
        }

        // employee lookup by the same display-name rule the auth middleware uses
        const nameOf = (e) =>
            `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.email;
        const employeeByName = new Map(
            telecallers.map((e) => [nameOf(e).toLowerCase(), e])
        );

        const buildRow = (leadBy, m, employee) => {
            const byStatus = statusByCreator.get(leadBy) || {};
            const total = m?.total || 0;
            const converted = CONVERTED_STATUSES.reduce(
                (sum, s) => sum + (byStatus[s] || 0),
                0
            );
            const role = employee
                ? "telecaller"
                : m?.leadByModel === "Admin"
                    ? "admin"
                    : "other";

            return {
                leadBy,
                leadById: employee?._id || m?.leadById || null,
                role,
                profileImage: employee?.profileImage || null,
                total,
                byStatus,
                createdToday: m?.createdToday || 0,
                followUpsToday: m?.followUpsToday || 0,
                overdueFollowUps: m?.overdueFollowUps || 0,
                invoicesLinked: m?.invoicesLinked || 0,
                converted,
                conversionRate: pct(converted, total),
                lastActivityAt: m?.lastActivityAt || null,
            };
        };

        const rows = [];
        const seen = new Set();

        for (const m of metricRows) {
            const employee = employeeByName.get(String(m._id).toLowerCase());
            rows.push(buildRow(m._id, m, employee));
            seen.add(String(m._id).toLowerCase());
        }

        // telecallers who created nothing in this range
        for (const e of telecallers) {
            const name = nameOf(e);
            if (!seen.has(name.toLowerCase())) {
                rows.push(buildRow(name, null, e));
            }
        }

        rows.sort(
            (a, b) => b.total - a.total || a.leadBy.localeCompare(b.leadBy)
        );

        // overall summary
        const byStatus = {};
        let total = 0;
        let converted = 0;
        const summary = {
            createdToday: 0,
            followUpsToday: 0,
            overdueFollowUps: 0,
            invoicesLinked: 0,
        };
        for (const r of rows) {
            total += r.total;
            converted += r.converted;
            summary.createdToday += r.createdToday;
            summary.followUpsToday += r.followUpsToday;
            summary.overdueFollowUps += r.overdueFollowUps;
            summary.invoicesLinked += r.invoicesLinked;
            for (const [status, count] of Object.entries(r.byStatus)) {
                byStatus[status] = (byStatus[status] || 0) + count;
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                range,
                from: start,
                to: end,
                summary: {
                    total,
                    byStatus,
                    ...summary,
                    converted,
                    conversionRate: pct(converted, total),
                    activeTelecallers: rows.filter(
                        (r) => r.role === "telecaller" && r.total > 0
                    ).length,
                    totalTelecallers: telecallers.length,
                },
                telecallers: rows,
            },
        });
    } catch (error) {
        console.error("Lead Overview Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to build leads overview.",
            error: error.message,
        });
    }
};
