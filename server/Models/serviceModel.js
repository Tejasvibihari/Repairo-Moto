import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
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

// Service names must be unique, ignoring upper/lower case.
serviceSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
serviceSchema.index({ priority: 1, name: 1 });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
