import mongoose from "mongoose";


const adminSettingsSchema = new mongoose.Schema({

    companyName: {
        type: String,
        default: "Repairo Moto",
    },
    address: {
        type: String,
        default: "123 Mechanic Street, Workshop Area",
    },
    city: {
        type: String,
        default: "New Delhi",
    },
    pin: {
        type: String,
        default: "110001",
    },
    contactNo: {
        type: String,
        default: "011-12345678",
    },
    email: {
        type: String,
        default: "repairomoto@gmail.com",
    },
    gstNo: {
        type: String,
        default: "27AADCB2230M1ZT",
    },

    // ── Payment collection details ──────────────────────────────────────────
    // Used to render a dynamic UPI "Scan & Pay" QR code (pre-filled with the
    // invoice's collectable amount) and a bank-transfer fallback on manually
    // generated invoices. Left blank, the invoice simply omits that section.
    upiId: {
        type: String,
        default: "",          // e.g. "repairomoto@okhdfcbank"
    },
    upiPayeeName: {
        type: String,
        default: "",          // name shown to the payer in their UPI app; falls back to companyName if blank
    },
    bankAccountName: {
        type: String,
        default: "",
    },
    bankAccountNumber: {
        type: String,
        default: "",
    },
    bankIFSC: {
        type: String,
        default: "",
    },
    bankName: {
        type: String,
        default: "",
    },
    bankBranch: {
        type: String,
        default: "",
    },

    // ── Shop status (customer app kill-switch) ──────────────────────────────
    // When `isClosed` is true the customer app shows a full-screen closed
    // message and the API refuses new user bookings. The copy is fully
    // admin-editable so it can be tailored per occasion (Diwali, Holi, ...).
    shopStatus: {
        isClosed: { type: Boolean, default: false },
        title: { type: String, default: "We'll be back soon", trim: true, maxlength: 80 },
        message: {
            type: String,
            default: "Sorry for the inconvenience. We are currently closed and will be back shortly. Thank you for your patience and understanding.",
            trim: true,
            maxlength: 500,
        },
        emoji: { type: String, default: "🛠️", trim: true, maxlength: 8 },
        // Optional: the closure lifts itself at this moment (no need to remember to flip the switch back).
        reopenAt: { type: Date, default: null },
        updatedAt: { type: Date, default: null },
    },

    // ── Daily service hours (IST) ───────────────────────────────────────────
    // Outside these hours the shop is still "open" for the app, but Emergency
    // Repair bookings are refused - only Schedule Repair can be booked.
    // Disabled by default so existing behaviour is unchanged until the admin opts in.
    serviceHours: {
        enabled: { type: Boolean, default: false },
        openTime: { type: String, default: "10:00" },   // "HH:mm", 24h, IST
        closeTime: { type: String, default: "17:00" },  // "HH:mm", 24h, IST
    },

    // ── Future booking policy ───────────────────────────────────────────────
    // Dates are calendar dates in IST, stored as YYYY-MM-DD strings.
    storeClosures: [{
        date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
        title: { type: String, default: 'Store closed', trim: true, maxlength: 80 },
        message: { type: String, default: 'We are closed on this date. Please choose another date.', trim: true, maxlength: 300 },
    }],
    // ── WhatsApp alerts to customers ────────────────────────────────────────
    // Master switch for order-status WhatsApp messages (booking confirmed, mechanic assigned,
    // status changes, invoice, payment, cancellation ...). Admin can flip it from the Console.
    whatsappNotifications: {
        orderStatusEnabled: { type: Boolean, default: true },
        updatedAt: { type: Date, default: null },
    },
    bookingPolicy: {
        dailyOrderLimit: { type: Number, default: null, min: 1, max: 10000 },
        limitMessage: { type: String, default: 'We have reached our booking limit for this date. Please choose another date.', trim: true, maxlength: 300 },
    },
})

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;