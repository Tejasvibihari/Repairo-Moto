import mongoose from 'mongoose';

// A service is defined for ONE bike brand + model, e.g.
//   Hero > Splendor > General service > ₹500
// The same service name can exist under many models, each with its own price
// and description. brandName / modelName are snapshots so the list still reads
// correctly if the brand or model is renamed or removed later.
const serviceSchema = new mongoose.Schema({
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: [true, 'Brand is required'],
    },
    brandName: { type: String, trim: true, default: '' },
    // _id of the sub-document inside Brand.models
    model: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Model is required'],
    },
    modelName: { type: String, trim: true, default: '' },
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        maxlength: 120,
    },
    description: {
        type: String,
        trim: true,
        default: '',
        maxlength: 2000,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0,
    },
    // Display order: lower number = shown first.
    priority: {
        type: Number,
        default: 0,
        min: 0,
    },
    // Approximate time needed to complete the service, in minutes.
    estimatedMinutes: {
        type: Number,
        required: [true, 'Approximate completion time is required'],
        min: 1,
    },
    createdBy: {
        id: { type: mongoose.Schema.Types.ObjectId },
        model: { type: String, enum: ['Admin', 'Employee'] },
        name: { type: String },
    },
}, {
    timestamps: true,
});

// A service name must be unique within a brand + model, ignoring upper/lower case.
serviceSchema.index({ brand: 1, model: 1, name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
serviceSchema.index({ priority: 1, name: 1 });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
