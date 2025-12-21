import mongoose from 'mongoose';

const HairStyleSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: false,
    default: 0,
  },
  // Price variations for styles with size/length options
  priceVariations: [{
    name: { type: String, required: true },  // e.g. "Shoulder", "Midback", "Waist"
    price: { type: Number, required: true }, // e.g. 459, 559, 659
  }],
  variationLabel: {
    type: String,
    default: 'Select Length',  // e.g. "Select Length", "Select Hair and workmanship"
  },
  description: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  imagePublicId: {
    type: String,
    default: '',
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: String,
    default: '',
  },
  imagePosition: {
    type: String,
    enum: ['top', 'center', 'bottom'],
    default: 'top',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

export default mongoose.models.HairStyle || mongoose.model('HairStyle', HairStyleSchema); 