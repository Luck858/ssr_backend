import express from "express";
import RecruiterLogo from "../models/RecruiterLogo.js";
import { upload, cloudinary } from "../config/cloudinary.js"

const router = express.Router();

/* =============================================
   Helper - Extract Cloudinary public_id
============================================= */
const getPublicId = (url) => {
  if (!url) return null;

  const parts = url.split("/");
  const filename = parts.pop();      // abc123.jpg
  const folder = parts.pop();        // recruiters

  return `${folder}/${filename.split(".")[0]}`; // recruiters/abc123
};

/* =============================================
   POST - Add Logo
============================================= */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("➡️ DEBUG req.body:", req.body);
    console.log("➡️ DEBUG req.file:", req.file);

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Upload an image" });
    }

    const newLogo = await RecruiterLogo.create({
      companyName: req.body.companyName,
      imageUrl: req.file.path, // Cloudinary URL
      order: Number(req.body.order) || 0,
      isActive: req.body.isActive === "true",
    });

    res.status(201).json({
      success: true,
      message: "Logo added",
      data: newLogo,
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =============================================
   GET - All logos
============================================= */
router.get("/", async (req, res) => {
  try {
    const logos = await RecruiterLogo.find().sort({ order: 1 });
    res.json({ success: true, data: logos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =============================================
   PUT - Update Logo
============================================= */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const logo = await RecruiterLogo.findById(req.params.id);

    if (!logo)
      return res.status(404).json({ success: false, message: "Not found" });

    const updateData = {
      companyName: req.body.companyName,
      order: Number(req.body.order) || 0,
      isActive: req.body.isActive === "true",
    };

    // If uploading a new image
    if (req.file) {
      const publicId = getPublicId(logo.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      updateData.imageUrl = req.file.path; // New cloudinary URL
    }

    const updated = await RecruiterLogo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, message: "Updated", data: updated });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =============================================
   DELETE - Remove Logo
============================================= */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await RecruiterLogo.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    const publicId = getPublicId(deleted.imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ success: true, message: "Logo deleted" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
