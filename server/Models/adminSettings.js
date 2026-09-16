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
})

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;