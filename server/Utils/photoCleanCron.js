/**
 * photoCleanupCron.js
 *
 * Cron job that runs every hour and deletes before/after repair photos
 * for orders whose `photosScheduledDeleteAt` timestamp has passed and
 * whose photos have not yet been deleted.
 *
 * Setup in server.js / app.js:
 *
 *   import './jobs/photoCleanupCron.js';
 *
 * Requires:
 *   npm install node-cron
 */

import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import Order from '../Models/orderModel.js';

/**
 * Delete a single file from disk.
 * Silently ignores "file not found" errors.
 */
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[PhotoCleanup] Deleted: ${filePath}`);
        }
    } catch (err) {
        console.error(`[PhotoCleanup] Failed to delete ${filePath}:`, err.message);
    }
};

/**
 * Delete an entire directory (and all its contents) if it is empty
 * or contains only the photos we just wiped.
 */
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

/**
 * Main cleanup task:
 * 1. Find all orders where photosScheduledDeleteAt ≤ now AND photosDeleted = false.
 * 2. For each, delete beforePhotos and afterPhotos from disk.
 * 3. Clear the photo arrays in the DB and set photosDeleted = true.
 */
const runPhotoCleanup = async () => {
    console.log('[PhotoCleanup] Running photo cleanup job…');
    try {
        const now = new Date();

        // Find eligible orders (batch up to 100 at a time to keep memory low)
        const orders = await Order.find({
            photosScheduledDeleteAt: { $lte: now },
            photosDeleted: false,
            $or: [
                { beforePhotos: { $exists: true, $not: { $size: 0 } } },
                { afterPhotos: { $exists: true, $not: { $size: 0 } } },
            ],
        }).limit(100);

        if (!orders.length) {
            console.log('[PhotoCleanup] No photos to clean up.');
            return;
        }

        for (const order of orders) {
            const allPhotos = [
                ...(order.beforePhotos || []),
                ...(order.afterPhotos || []),
            ];

            // Delete every photo file
            for (const filePath of allPhotos) {
                deleteFile(filePath);
            }

            // Try to remove the per-order upload directory if now empty
            cleanupOrderDir(order._id.toString());

            // Update DB: clear photo arrays and mark as deleted
            order.beforePhotos = [];
            order.afterPhotos = [];
            order.photosDeleted = true;
            await order.save();

            console.log(`[PhotoCleanup] Cleaned photos for order ${order.orderId} (${order._id})`);
        }
    } catch (err) {
        console.error('[PhotoCleanup] Job error:', err);
    }
};

// ─── Schedule: every hour at minute 0 ────────────────────────────────────────
// Adjust the cron expression to your preference:
//   '0 * * * *'   → every hour
//   '0 2 * * *'   → once daily at 02:00
cron.schedule('0 * * * *', runPhotoCleanup, {
    timezone: 'Asia/Kolkata', // adjust to your server timezone
});

console.log('[PhotoCleanup] Photo cleanup cron job scheduled (every hour).');

export default runPhotoCleanup; // export for manual testing