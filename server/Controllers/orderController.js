import Order from "../Models/orderModel.js";
import Employee from "../Models/employeeModel.js";
import Vendor from '../Models/vendorModel.js'
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
export const getOrderById = async (req, res) => {
    console.log(req.params.id)
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        return res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return res.status(500).json({ message: 'Server error while fetching order' });
    }
};

export const updateMechanic = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from the request parameters
        const { mechanicId } = req.body; // Extract mechanic ID from the request body

        // Validate input
        if (!mechanicId) {
            return res.status(400).json({ message: "Mechanic ID is required" });
        }

        // Find the mechanic by ID in the Employee collection
        const mechanic = await Employee.findById(mechanicId);
        if (!mechanic) {
            return res.status(404).json({ message: "Mechanic not found" });
        }

        // Update the order with the mechanic's name and ID
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                assignedMechanic: `${mechanic.firstName} ${mechanic.lastName}`, // Update with the mechanic's full name
                mechanicId: mechanic._id, // Update with the mechanic's ID
            },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({
            message: "Mechanic updated successfully",
            data: updatedOrder,
        });
    } catch (error) {
        console.error("Error updating mechanic:", error);
        return res.status(500).json({ message: "Server error while updating mechanic" });
    }
};
export const updateDelivery = async (req, res) => {
    try {
        const { id } = req.params; // Order ID
        const { deliveryId } = req.body; // Delivery person ID

        if (!deliveryId) {
            return res.status(400).json({ message: "Delivery person ID is required" });
        }

        const deliveryPerson = await Employee.findById(deliveryId);
        if (!deliveryPerson) {
            return res.status(404).json({ message: "Delivery person not found" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                assignedDelivery: `${deliveryPerson.firstName} ${deliveryPerson.lastName}`, // Update assignedDelivery with the delivery person's name
                deliveryId: deliveryPerson._id, // Update deliveryId with the delivery person's ID
            },
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Delivery person updated successfully", data: updatedOrder });
    } catch (error) {
        console.error("Error updating delivery person:", error);
        res.status(500).json({ message: "Server error while updating delivery person" });
    }
};

export const updateVendor = async (req, res) => {
    try {
        const { id } = req.params; // Order ID
        const { vendorId } = req.body; // Vendor ID

        if (!vendorId) {
            return res.status(400).json({ message: "Vendor ID is required" });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                assignedVendor: `${vendor.firstName} ${vendor.lastName}`, // Update assignedVendor with the vendor's name
                vendorId: vendor._id, // Update vendorId with the vendor's ID
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Vendor updated successfully", data: updatedOrder });
    } catch (error) {
        console.error("Error updating vendor:", error);
        res.status(500).json({ message: "Server error while updating vendor" });
    }
};
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // Extract order ID from the request parameters
        const { status } = req.body; // Extract the updated status from the request body

        // Validate input
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        // Update the order status
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status }, // Update the status field
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            data: updatedOrder,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ message: "Server error while updating order status" });
    }
};


export const getAllBookingsByEmployee = async (req, res) => {
    const { employeeId } = req.params;
    try {
        // Fetch all bookings assigned to the given employee ID (mechanicId, deliveryId, or vendorId)
        const orders = await Order.find({
            $or: [
                { mechanicId: employeeId },
                { deliveryId: employeeId },
                { vendorId: employeeId }
            ]
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No bookings found for this employee." });
        }

        res.status(200).json({ message: "Orders fetched successfully", data: orders });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updatePartsUsed = async (req, res) => {
    const { id } = req.params;
    const { partsUsed } = req.body;
    try {
        // Basic validation
        if (!Array.isArray(partsUsed) || partsUsed.some(part =>
            !part.name || typeof part.name !== 'string' ||
            typeof part.quantity !== 'number' || part.quantity < 1
        )) {
            return res.status(400).json({ message: 'Invalid parts data format' });

        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Push each new part into existing partsUsed array
        partsUsed.forEach(part => {
            order.partsUsed.push({
                partName: part.name,
                quantity: part.quantity,
                price: 0, // Set price to 0 for every new part
            });
        });

        await order.save();

        res.status(200).json({ message: 'Parts added successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating parts' });
    }
};

