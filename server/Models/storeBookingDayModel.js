import mongoose from 'mongoose';

const storeBookingDaySchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    count: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true });

export default mongoose.model('StoreBookingDay', storeBookingDaySchema);
