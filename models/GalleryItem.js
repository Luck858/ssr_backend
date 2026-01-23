import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    required: true
  }
});

const galleryItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["event", "single"],
      required: true,
      default: "single"
    },

    // For single images (no event)
    singleImage: {
      type: imageSchema,
      default: null
    },

    // For event-based grouped uploads
    eventName: {
      type: String,
      default: null
    },
    eventDescription: {
      type: String,
      default: ""
    },
    eventDate: {
      type: Date,
      default: null
    },
    images: {
      type: [imageSchema], // event: multiple images
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("GalleryItem", galleryItemSchema);
