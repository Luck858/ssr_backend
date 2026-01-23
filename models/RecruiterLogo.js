import mongoose from "mongoose";

const recruiterLogoSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("RecruiterLogo", recruiterLogoSchema);
