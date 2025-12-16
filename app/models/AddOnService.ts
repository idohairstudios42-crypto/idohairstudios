import mongoose from 'mongoose';

const AddOnServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    category: {
        type: String,
        default: 'general',
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

export default mongoose.models.AddOnService || mongoose.model('AddOnService', AddOnServiceSchema);
