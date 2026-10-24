import express from 'express';
import authAdmin from '../Middleware/authAdmin.js';
import requireAdminOrManager from '../Middleware/requireAdminOrManager.js';
import {
    getPublicSlots,
    adminListSlots,
    createSlot,
    updateSlot,
    toggleSlot,
    deleteSlot,
    generateSlots,
} from '../Controllers/bookingSlotController.js';

// ─── Admin router — mount at /api/admin/booking-slots ────────────────────────
export const adminBookingSlotRouter = express.Router();
adminBookingSlotRouter.use(authAdmin, requireAdminOrManager);

adminBookingSlotRouter.get('/', adminListSlots);
adminBookingSlotRouter.post('/', createSlot);
adminBookingSlotRouter.post('/generate', generateSlots); // keep above '/:id'
adminBookingSlotRouter.put('/:id', updateSlot);
adminBookingSlotRouter.patch('/:id/toggle', toggleSlot);
adminBookingSlotRouter.delete('/:id', deleteSlot);

// ─── Public router — mount at /api/booking-slots ─────────────────────────────
// Read-only: the customer app / web fetches the slots to show while booking.
export const publicBookingSlotRouter = express.Router();
publicBookingSlotRouter.get('/', getPublicSlots);

export default adminBookingSlotRouter;
