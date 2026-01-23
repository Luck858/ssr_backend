import express from "express";
import GalleryItem from "../models/GalleryItem.js";
import { createUploader, cloudinary } from "../config/cloudinary.js";

const router = express.Router();

// Cloudinary uploader for Gallery images
const uploadGallery = createUploader("gallery");

// ===========================================================
// 1️⃣ UPLOAD SINGLE IMAGE (NO EVENT)
// ===========================================================
router.post("/single", uploadGallery.single("image"), async (req, res) => {
  try {
    console.log("📥 SINGLE UPLOAD HIT");
    console.log("🧾 BODY:", req.body);
    console.log("📂 FILE:", req.file);

    if (!req.file)
      return res.status(400).json({ message: "No file received" });

    const img = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    const newItem = await GalleryItem.create({
      type: "single",
      singleImage: img,
    });

    res.status(201).json({ message: "Single image uploaded", item: newItem });
  } catch (error) {
    console.error("❌ Upload single error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ===========================================================
// 2️⃣ UPLOAD MULTIPLE IMAGES FOR EVENT
// ===========================================================
router.post(
  "/event",
  (req, res, next) => {
    console.log("🔥 Multer starting for EVENT upload");
    next();
  },
  uploadGallery.array("images", 20),
  async (req, res) => {
    try {
      console.log("📥 EVENT UPLOAD HIT");
      console.log("🧾 BODY:", req.body);
      console.log("📂 FILES:", req.files);

      if (!req.files || req.files.length === 0) {
        console.log("❌ No files received by multer!");
        return res.status(400).json({ message: "No images found in request" });
      }

      const { eventName, eventDate, eventDescription } = req.body;

      if (!eventName || !eventDate)
        return res.status(400).json({
          message: "eventName and eventDate are required",
        });

      const images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      const newEvent = await GalleryItem.create({
        type: "event",
        eventName,
        eventDate,
        eventDescription,
        images,
      });

      res.status(201).json({
        message: "Event images uploaded successfully",
        event: newEvent,
      });
    } catch (error) {
      console.error("❌ Upload event error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// ===========================================================
// 3️⃣ GET ALL ITEMS
// ===========================================================
router.get("/", async (req, res) => {
  try {
    console.log("📥 FETCH ALL GALLERY ITEMS HIT");
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    console.error("❌ Fetch gallery error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================================
// 4️⃣ DELETE SINGLE
// ===========================================================
router.delete("/single/:id", async (req, res) => {
  try {
    console.log("🗑 DELETE SINGLE HIT:", req.params.id);

    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });

    await cloudinary.uploader.destroy(item.singleImage.public_id);

    await item.deleteOne();

    res.json({ message: "Single image deleted" });
  } catch (error) {
    console.error("❌ Delete single error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================================
// 5️⃣ DELETE EVENT
// ===========================================================
router.delete("/event/:id", async (req, res) => {
  try {
    console.log("🗑 DELETE EVENT HIT:", req.params.id);

    const event = await GalleryItem.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    for (let img of event.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await event.deleteOne();

    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error("❌ Delete event error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================================
// 6️⃣ DELETE IMAGE FROM EVENT
// ===========================================================
router.delete("/event/:eventId/image/:publicId", async (req, res) => {
  try {
    console.log("🗑 DELETE EVENT IMAGE HIT:", req.params);

    const { eventId, publicId } = req.params;

    const event = await GalleryItem.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await cloudinary.uploader.destroy(publicId);

    event.images = event.images.filter((img) => img.public_id !== publicId);
    await event.save();

    res.json({ message: "Image removed from event" });
  } catch (error) {
    console.error("❌ Delete event image error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================================
// 7️⃣ UPDATE EVENT DETAILS
// ===========================================================
router.put("/event/:id", async (req, res) => {
  try {
    console.log("✏ UPDATE EVENT HIT:", req.params.id, req.body);

    const { eventName, eventDate, eventDescription } = req.body;

    const updated = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      { eventName, eventDate, eventDescription },
      { new: true }
    );

    res.json({ message: "Event updated", event: updated });
  } catch (error) {
    console.error("❌ Update event error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================================================
// 8️⃣ ADD MORE IMAGES TO EVENT
// ===========================================================
router.post(
  "/event/:id/images",
  (req, res, next) => {
    console.log("🔥 Multer starting for ADD EVENT IMAGES");
    next();
  },
  uploadGallery.array("images", 20),
  async (req, res) => {
    try {
      console.log("📥 ADD IMAGES HIT:", req.params.id);
      console.log("📂 FILES:", req.files);

      const eventId = req.params.id;

      const event = await GalleryItem.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      event.images.push(...newImages);
      await event.save();

      res.json({
        message: "Images added to event successfully",
        event,
      });
    } catch (error) {
      console.error("❌ Add images to event error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default router;
