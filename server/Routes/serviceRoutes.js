import express from 'express';
import authAdmin from '../Middleware/authAdmin.js';
import requireAdminOrManager from '../Middleware/requireAdminOrManager.js';
import {
    listServices,
    getService,
    createService,
    updateService,
    deleteService,
} from '../Controllers/serviceController.js';

// Mount at /api/admin/services
// Only Admin, Manager and Operational Manager may use these routes
// (authAdmin also lets telecallers in, so requireAdminOrManager narrows it).
const router = express.Router();
router.use(authAdmin, requireAdminOrManager);

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
