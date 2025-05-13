import Order from "../Models/orderModel.js";
import Employee from "../Models/employeeModel.js";
import Vendor from '../Models/vendorModel.js'
import VendorOrder from "../Models/vendorOrderModel.js";
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

        if (!name || !contactNo || !city || !selectedBrand || !selectedModel || !cc || !services.length || !preferredDate || !preferredTime || !estimatedBudget) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        // Format today's date as DDMMYY
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const yy = String(now.getFullYear()).slice(-2);
        const todayFormatted = `${dd}${mm}${yy}`;

        // Get the latest order for today
        const latestOrder = await Order.findOne({ orderId: { $regex: `^ORD-${todayFormatted}` } })
            .sort({ createdAt: -1 })
            .lean();

        let serial = 1;
        if (latestOrder && latestOrder.orderId) {
            const parts = latestOrder.orderId.split('-');
            if (parts.length === 3) {
                serial = parseInt(parts[2], 10) + 1;
            }
        }

        const orderId = `ORD-${todayFormatted}-${String(serial).padStart(3, '0')}`;

        const newOrder = new Order({
            orderId,
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

export const getAllBookingsByVendor = async (req, res) => {
    const { vendorId } = req.params;
    try {
        // Fetch all bookings assigned to the given vendor ID
        const orders = await Order.find({ vendorId: vendorId });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No bookings found for this vendor." });
        }

        res.status(200).json({ message: "Bookings fetched successfully", data: orders });
    } catch (error) {
        console.error("Error fetching bookings by vendor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const updatePartsUsed = async (req, res) => {
    const { id } = req.params;
    const { partsUsed } = req.body;
    console.log(id)
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Replace the entire partsUsed array with new data
        order.partsUsed = partsUsed.map(part => ({
            partName: part.partName,
            quantity: part.quantity,
            price: 0, // Default price 0
            discountPrice: 0 // Optional: include if your schema allows it
        }));

        await order.save();

        res.status(200).json({ message: 'Parts updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating parts' });
    }
};


export const updatePartsPrice = async (req, res) => {
    const { id } = req.params; // Order ID
    const { partsUsed } = req.body; // Array of partsUsed
    console.log(partsUsed)
    try {
        // 1. Find the order
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // 2. Update order's partsUsed
        order.partsUsed = partsUsed.map(part => ({
            partName: part.partName,
            quantity: part.quantity,
            price: part.price,
            discountPrice: part.discountPrice
        }));

        // 3. Save the updated order
        await order.save();

        // 4. Create a new VendorOrder document
        const vendorOrder = new VendorOrder({
            partsUsed: order.partsUsed,
            vendorId: order.vendorId,
            deliveryBoyId: order.deliveryId,
            deliveryBoyName: order.assignedDelivery,
            orderDate: new Date() // Optional, defaults to now
        });

        await vendorOrder.save();

        // 5. Send response
        res.status(200).json({
            message: 'Parts pricing updated successfully and vendor order saved.',
            order,
            vendorOrder
        });

    } catch (error) {
        console.error('Error updating parts pricing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const updateOrderandGenerateInvoice = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        // Separate parts and services from partsAndServices
        const partsUsed = data.partsAndServices.filter(item => item.type === 'part').map(item => ({
            partName: item.name,
            quantity: item.quantity,
            price: item.price,
            discountPrice: item.discountPrice
        }));

        const serviceProvided = data.partsAndServices.filter(item => item.type === 'service').map(item => ({
            serviceName: item.name,
            quantity: item.quantity,
            price: item.price,
            discountPrice: item.discountPrice
        }));

        // Construct the update object
        const updatedFields = {
            invoiceDate: data.invoiceDetails.invoiceDate,
            partsUsed,
            serviceProvided,
            total: {
                subTotal: data.total.subtotal,
                discount: data.total.discount,
                discountType: data.total.discountType,
                total: data.total.total
            }
        };

        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(id, {
            $set: updatedFields
        }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order updated and invoice generated successfully",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

export const userOrder = async (req, res) => {
    try {
        const {
            userId,
            name,
            contactNo,
            email,
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

        if (!name || !contactNo || !city || !selectedBrand || !selectedModel || !cc || !services.length || !preferredDate || !preferredTime || !estimatedBudget) {
            return res.status(400).json({ message: 'Please fill all required fields.' });
        }

        // Format today's date as DDMMYY
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const todayFormatted = `${dd}${mm}${yy}`;

        // Get latest order with today's date in orderId
        const latestOrder = await Order.findOne({ orderId: { $regex: `^ORD-${todayFormatted}` } })
            .sort({ createdAt: -1 })
            .lean();

        let serial = 1;
        if (latestOrder && latestOrder.orderId) {
            const parts = latestOrder.orderId.split('-');
            if (parts.length === 3) {
                serial = parseInt(parts[2], 10) + 1;
            }
        }

        const orderId = `ORD-${todayFormatted}-${String(serial).padStart(3, '0')}`;

        const newOrder = new Order({
            orderId,
            userId,
            name,
            contactNo,
            email,
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


export const getOrderByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const orders = await Order.find({ email });

        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found' });
        }

        return res.status(200).json({
            message: 'Orders fetched successfully',
            orders: orders
        });

    } catch (error) {
        console.error("Error Fetching Orders:", error);
        return res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

export const cancelOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'Cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        order.status = 'Cancelled';
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Server error while cancelling order' });
    }
};

export const getOrdersByPosition = async (req, res) => {
    const { position, employeeId } = req.query; // or from req.params if using route params

    if (!position || !employeeId) {
        return res.status(400).json({ message: 'Position and employeeId are required.' });
    }

    try {
        let filter = {};

        switch (position.toLowerCase()) {
            case 'delivery':
                filter = { deliveryId: employeeId };
                break;
            case 'mechanic':
                filter = { mechanicId: employeeId };
                break;
            default:
                return res.status(400).json({ message: 'Invalid position provided.' });
        }

        const orders = await Order.find(filter);
        res.status(200).json(orders);

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};