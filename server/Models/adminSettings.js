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
    }
})

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;
