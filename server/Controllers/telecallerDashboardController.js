import Lead from '../Models/leadModel.js';

// GET /api/employee/dashboard
export const getTelecallerDashboard = async (req, res) => {
    try {
        const leadBy = req.user?.leadBy || req.query.leadBy;

        if (!leadBy) {
            return res.status(400).json({ success: false, message: 'telecaller identifier (leadBy) is required' });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const baseMatch = { isDeleted: false, leadBy };

        const [
            totalAssigned,
            statusAgg,
            newToday,
            followUpsToday,
            bookedCount,
            invoicesLinked,
            recentLeads,
        ] = await Promise.all([
            Lead.countDocuments(baseMatch),
            Lead.aggregate([
                { $match: baseMatch },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Lead.countDocuments({ ...baseMatch, createdAt: { $gte: startOfDay } }),
            Lead.countDocuments({ ...baseMatch, 'followUp.date': { $gte: startOfDay, $lte: endOfDay } }),
            Lead.countDocuments({ ...baseMatch, status: 'booked' }),
            Lead.countDocuments({ ...baseMatch, 'invoice.linked': true }),
            Lead.find(baseMatch)
                .sort({ createdAt: -1 })
                .limit(10)
                .select('customer vehicle status followUp invoice createdAt')
                .lean(),
        ]);

        const countsByStatus = {};
        (statusAgg || []).forEach((it) => {
            countsByStatus[it._id] = it.count;
        });

        return res.status(200).json({
            success: true,
            data: {
                totalAssigned,
                countsByStatus,
                newToday,
                followUpsToday,
                bookedCount,
                invoicesLinked,
                recentLeads,
            },
        });
    } catch (err) {
        console.error('Telecaller dashboard error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

export default { getTelecallerDashboard };
