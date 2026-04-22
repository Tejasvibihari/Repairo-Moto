import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import Order from '../Models/orderModel.js';

const deleteFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[PhotoCleanup] Deleted: ${filePath}`);
        }
    } catch (err) {
        console.error(`[PhotoCleanup] Failed to delete ${filePath}:`, err.message);
    }
};

const cleanupOrderDir = (orderId) => {
    const dir = path.join('uploads', 'orders', orderId);
    try {
        if (fs.existsSync(dir)) {
            const remaining = fs.readdirSync(dir);
            if (remaining.length === 0) {
                fs.rmdirSync(dir);
                console.log(`[PhotoCleanup] Removed empty dir: ${dir}`);
            }
        }
    } catch (err) {
        console.error(`[PhotoCleanup] Failed to clean dir ${dir}:`, err.message);
    }
};

const runPhotoCleanup = async () => {
    console.log('[PhotoCleanup] Running photo cleanup job…');
    try {
        const now = new Date();

        const orders = await Order.find({
            photosScheduledDeleteAt: { $lte: now },
            photosDeleted: false,
            status: 'Completed',          // ← safety guard: only touch completed orders
            $or: [
                { beforePhoto: { $ne: null } },   // ← singular, matches your schema
                { afterPhoto: { $ne: null } },     // ← singular, matches your schema
            ],
        }).limit(100);

        if (!orders.length) {
            console.log('[PhotoCleanup] No photos to clean up.');
            return;
        }

        for (const order of orders) {
            // Delete both photos from disk
            deleteFile(order.beforePhoto);
            deleteFile(order.afterPhoto);

            // Clean up the order's upload directory if empty
            cleanupOrderDir(order._id.toString());

            // Clear photo fields in DB and mark deleted
            order.beforePhoto = null;
            order.afterPhoto = null;
            order.photosDeleted = true;
            await order.save();

            console.log(`[PhotoCleanup] Cleaned photos for order ${order.orderId}`);
        }
    } catch (err) {
        console.error('[PhotoCleanup] Job error:', err);
    }
};

// Every hour — adjust as needed
cron.schedule('0 * * * *', runPhotoCleanup, {
    timezone: 'Asia/Kolkata',
});

console.log('[PhotoCleanup] Cron scheduled (every hour).');
export default runPhotoCleanup;