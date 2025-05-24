import mongoose from 'mongoose';

const bikeProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    cc: {
        type: Number,
        required: true
    },
    bs: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const BikeProfile = mongoose.model('BikeProfile', bikeProfileSchema);
export default BikeProfile;