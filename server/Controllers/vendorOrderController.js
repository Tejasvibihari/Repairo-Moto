import VendorOrder from "../Models/vendorOrderModel.js";



// export const getVendorByOrderId = async (req, res) => {
//     const { orderId } = req.params; // Extract orderId from request parameters

//     try {
//         // 1. Find the VendorOrder by orderId
//         const vendorOrder = await VendorOrder.findOne({ orderId });
//         if (!vendorOrder) {
//             return res.status(404).json({ message: "VendorOrder not found for the given order ID" });
//         }

//         // 2. Find the vendor by vendorId from the VendorOrder
//         const vendor = await VendorOrder.findById(vendorOrder.vendorId);
//         if (!vendor) {
//             return res.status(404).json({ message: "Vendor not found for the given vendor ID" });
//         }

//         // 3. Send the vendor details in the response
//         res.status(200).json({
//             message: "Vendor fetched successfully",
//             vendor,
//         });
//     } catch (error) {
//         console.error("Error fetching vendor by order ID:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

// Create getVendorOrderByVendorId 

export const getVendorOrderByVendorId = async (req, res) => {
    const { vendorId } = req.params; // Extract vendorId from request parameters

    try {
        // 1. Find all VendorOrders by vendorId
        const vendorOrders = await VendorOrder.find({ vendorId });
        if (!vendorOrders || vendorOrders.length === 0) {
            return res.status(404).json({ message: "No VendorOrders found for the given vendor ID" });
        }

        // 2. Send the vendor orders in the response
        res.status(200).json({
            vendorOrders,
        });
    } catch (error) {
        console.error("Error fetching vendor orders by vendor ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}