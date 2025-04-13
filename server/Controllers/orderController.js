import Order from "../Models/orderModel.js";

// @desc Create a new service booking
// @route POST /api/bookings
// @access Public
export const createManualOrder = async (req, res) => {
    try {
        const {
            name,
            contactNo,
            city,
            selectedBrand,
            selectedModel,
            modelName,
            cc,
            services,
            otherService,
            preferredDate,
            preferredTime,
            estimatedBudget,
            issues
        } = req.body;

        // Basic validation (can be enhanced)
        if (!name || !contactNo || !city || !selectedBrand || !selectedModel || !cc || !services.length || !preferredDate || !preferredTime || !estimatedBudget) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        const newOrder = new Order({
            name,
            contactNo,
            city,
            selectedBrand,
            selectedModel,
            modelName,
            cc,
            services,
            otherService,
            preferredDate,
            preferredTime,
            estimatedBudget,
            issues
        });

        const savedOrder = await newOrder.save();
        return res.status(201).json({
            message: 'Order Confirmed!',
            data: savedOrder
        });

    } catch (error) {
        console.error("Error Creating Order:", error);
        return res.status(500).json({ message: 'Server error while creating Order' });
    }
};

// (Optional) @desc Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).json({ message: 'Server error while fetching bookings' });
    }
};

// (Optional) @desc Get single booking by ID
export const getBookingById = async (req, res) => {
    try {
        const booking = await ServiceBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        return res.status(200).json(booking);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return res.status(500).json({ message: 'Server error while fetching booking' });
    }
};
