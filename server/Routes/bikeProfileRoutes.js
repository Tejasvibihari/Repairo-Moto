import express from 'express';
import { createBikeProfile, deleteBikeProfile, getBikeProfilesByUser, updateBikeProfile } from '../Controllers/bikeProfileController.js';

const router = express.Router();

// Routes
router.post('/create/:id', createBikeProfile);
router.get('/get-bike-profile/:userId', getBikeProfilesByUser);
router.put('/:id', updateBikeProfile);
router.delete('/:id', deleteBikeProfile);

export default router;
