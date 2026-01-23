import mongoose from 'mongoose';

const heroCarouselSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },

  cloudinaryId: {       // ⭐ ADD THIS FIELD
    type: String,
    required: true,
  },

  order: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

}, { timestamps: true });

export default mongoose.model('HeroCarousel', heroCarouselSchema);
