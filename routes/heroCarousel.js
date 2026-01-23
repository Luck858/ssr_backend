import express from "express";
import HeroCarousel from "../models/HeroCarousel.js";
import { createUploader, cloudinary } from "../config/cloudinary.js";

const router = express.Router();

// Cloudinary uploader (folder = hero_slides)
const uploadHero = createUploader("hero_slides");

/* =====================================================
   POST — Add Slide
===================================================== */
router.post("/slides", uploadHero.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
    }

    // req.file structure from Cloudinary:
    // req.file.path → Cloudinary URL
    // req.file.filename → public_id (folder/unique_name)

    const slide = await HeroCarousel.create({
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename, // ⭐ SAVE REAL PUBLIC_ID
      order: Number(req.body.order) || 0,
      isActive: req.body.isActive === "true" || req.body.isActive === true,
    });

    res.status(201).json({
      success: true,
      message: "Slide added successfully",
      data: slide,
    });
  } catch (error) {
    console.error("❌ POST Slide Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =====================================================
   GET — All Slides
===================================================== */
router.get("/slides", async (req, res) => {
  try {
    const slides = await HeroCarousel.find().sort({ order: 1 });
    res.json({ success: true, data: slides });
  } catch (error) {
    console.error("❌ GET Slides Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =====================================================
   PUT — Update Slide
===================================================== */
router.put("/slides/:id", uploadHero.single("image"), async (req, res) => {
  try {
    const slide = await HeroCarousel.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Slide not found",
      });
    }

    const updateData = {
      order: Number(req.body.order) || slide.order,
      isActive: req.body.isActive === "true" || req.body.isActive === true,
    };

    // If new image uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (slide.cloudinaryId) {
        await cloudinary.uploader.destroy(slide.cloudinaryId);
      }

      updateData.imageUrl = req.file.path;
      updateData.cloudinaryId = req.file.filename; // ⭐ NEW PUBLIC_ID
    }

    const updatedSlide = await HeroCarousel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Slide updated successfully",
      data: updatedSlide,
    });
  } catch (error) {
    console.error("❌ UPDATE Slide Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =====================================================
   DELETE — Slide
===================================================== */
router.delete("/slides/:id", async (req, res) => {
  try {
    const slide = await HeroCarousel.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Slide not found",
      });
    }

    // Delete image from Cloudinary
    if (slide.cloudinaryId) {
      await cloudinary.uploader.destroy(slide.cloudinaryId);
    }

    await slide.deleteOne();

    res.json({
      success: true,
      message: "Slide deleted successfully",
    });
  } catch (error) {
    console.error("❌ DELETE Slide Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
