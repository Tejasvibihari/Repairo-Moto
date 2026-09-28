import express from 'express';
import authAdmin from '../Middleware/authAdmin.js';
import {
    requireAdminOnly,
    previewAudience, createCampaign, listCampaigns, cancelCampaign,
    getConfig, updateConfig,
    setOrderFollowUp, listFollowUps,
} from '../Controllers/notificationAdminController.js';

const router = express.Router();
router.use(authAdmin);

// Manual campaigns — Admin only
router.post('/campaigns/preview', requireAdminOnly, previewAudience);
router.post('/campaigns', requireAdminOnly, createCampaign);
router.get('/campaigns', requireAdminOnly, listCampaigns);
router.delete('/campaigns/:id', requireAdminOnly, cancelCampaign);

// Automatic service-reminder settings
router.get('/reminder-config', getConfig);                       // any staff can read
router.put('/reminder-config', requireAdminOnly, updateConfig);  // only admin can change

// Per-order reminder (staff who manage bookings can set it)
router.get('/follow-ups', listFollowUps);
router.put('/follow-up/:orderId', setOrderFollowUp);

export default router;
