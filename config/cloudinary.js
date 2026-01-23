import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Debug
console.log("🌐 Cloudinary ENV Loaded:", {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  API_KEY: process.env.CLOUDINARY_API_KEY,
  API_SECRET: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
});

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =========================================================================
   DEFAULT UPLOADER (recruiters) — keep as is
========================================================================= */
const recruiterStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "recruiters",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const upload = multer({ storage: recruiterStorage });

/* =========================================================================
   NEW — Perfect Reusable Uploader for ANY folder
   This fixes:
   ✔ public_id issue
   ✔ secure_url issue
   ✔ multer crashing issues
========================================================================= */
export function createUploader(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: folderName,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      use_filename: false,
      unique_filename: true,
    })
  });

  const uploader = multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  return uploader;
}

export { cloudinary, upload };
