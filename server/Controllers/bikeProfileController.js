import BikeProfile from '../Models/bikeProfile.js';

// Create a new bike profile
export const createBikeProfile = async (req, res) => {
    try {
        const { brand, model, cc, bs } = req.body;
        const userId = req.user;

        const newProfile = new BikeProfile({
            user: userId,
            brand,
            model,
            cc,
            bs
        });

        const savedProfile = await newProfile.save();
        res.status(201).json({
            message: "Bike Profile Created", savedProfile
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get all bike profiles by user ID
export const getBikeProfilesByUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const profiles = await BikeProfile.find({ user: userId });
        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update bike profile by ID
export const updateBikeProfile = async (req, res) => {
    try {
        const profileId = req.params.id;
        const updated = await BikeProfile.findByIdAndUpdate(profileId, req.body, { new: true });

        if (!updated) return res.status(404).json({ message: 'Profile not found' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete bike profile by ID
export const deleteBikeProfile = async (req, res) => {
    try {
        const profileId = req.params.id;
        const deleted = await BikeProfile.findByIdAndDelete(profileId);

        if (!deleted) return res.status(404).json({ message: 'Profile not found' });
        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
