// models/Brand.js
import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

const brandSchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    models: [modelSchema], // Array of models under the brand
}, {
    timestamps: true,
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
