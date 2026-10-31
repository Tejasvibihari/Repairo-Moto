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
//
// authAdmin lets Admin, Manager, Operational Manager and Telecaller in.
//  - READ (list / get one): everyone authAdmin lets in, because anyone who can
//    create a manual invoice (including telecallers) must be able to pick a
//    saved service while doing so.
//  - WRITE (create / update / delete): Admin, Manager and Operational Manager
//    only (requireAdminOrManager).
const router = express.Router();
router.use(authAdmin);

router.get('/', listServices);
router.get('/:id', getService);

router.post('/', requireAdminOrManager, createService);
router.put('/:id', requireAdminOrManager, updateService);
router.delete('/:id', requireAdminOrManager, deleteService);

export default router;
