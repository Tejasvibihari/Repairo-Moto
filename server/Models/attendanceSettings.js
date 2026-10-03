import mongoose from "mongoose";

// Singleton: who hears about attendance besides the in-app admin push.
// Kept OUT of AdminSettings on purpose — GET /api/admin-settings is public and
// returns the whole document, which would expose these phone numbers.

const attendanceSettingsSchema = new mongoose.Schema({
    whatsappEnabled: { type: Boolean, default: true },
    // Also send the message to the employee's own phone number
    notifyEmployee: { type: Boolean, default: true },
    // Extra people (owner, accountant, HR ...) who get every attendance message
    numbers: [{
        _id: false,
        name: { type: String, trim: true, maxlength: 50, default: "" },
        number: { type: String, required: true },   // digits only, with country code (e.g. 919876543210)
        active: { type: Boolean, default: true },
    }],
}, { timestamps: true });

const AttendanceSettings = mongoose.model("AttendanceSettings", attendanceSettingsSchema);
export default AttendanceSettings;
