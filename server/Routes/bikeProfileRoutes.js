import express from 'express';
import { createBikeProfile, deleteBikeProfile, getBikeProfilesByUser, updateBikeProfile } from '../Controllers/bikeProfileController.js';
import authUser from '../Middleware/authUser.js';

const router = express.Router();

// Routes
router.post('/create', authUser, createBikeProfile);
router.get('/get-bike-profile', authUser, getBikeProfilesByUser);
router.put('/:id', authUser, updateBikeProfile);
router.delete('/:id', authUser, deleteBikeProfile);

export default router;
