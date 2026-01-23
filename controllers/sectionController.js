import Section from '../models/Section.js';
import Batch from '../models/Batch.js';
import mongoose from 'mongoose';

export const createSection = async (req, res) => {
  try {
    const { sectionName, department, batch, year, academicYear, capacity } = req.body;

    // resolve batch: accept either ObjectId or batchName (friendly)
    let batchId = batch;
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      // try to find batch by batchName
      const batchDoc = await Batch.findOne({ batchName: batchId });
      if (!batchDoc) {
        return res.status(400).json({ success: false, error: `Invalid batch: ${batch}` });
      }
      batchId = batchDoc._id;
    }

    const existingSection = await Section.findOne({
      department,
      batch: batchId,
      sectionName,
      academicYear
    });

    if (existingSection) {
      return res.status(400).json({
        success: false,
        error: `Section ${sectionName} already exists for this batch in ${academicYear}`
      });
    }

    const section = new Section({
      sectionName,
      department,
      batch: batchId,
      year,
      academicYear,
      capacity: capacity || 60
    });

    await section.save();

    const populatedSection = await Section.findById(section._id)
      .populate('department', 'departmentName')
      .populate('batch', 'batchName');

    res.status(201).json({ success: true, data: populatedSection });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const createMultipleSections = async (req, res) => {
  try {
    const { department, batch, year, academicYear, numberOfSections, capacity } = req.body;

    // resolve batch if a name was passed
    let batchId = batch;
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      const batchDoc = await Batch.findOne({ batchName: batchId });
      if (!batchDoc) {
        return res.status(400).json({ success: false, error: `Invalid batch: ${batch}` });
      }
      batchId = batchDoc._id;
    }
    

    if (!numberOfSections || numberOfSections < 1 || numberOfSections > 6) {
      
      return res.status(400).json({
        success: false,
        error: 'Number of sections must be between 1 and 6'
      });
    }

    const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const sectionsToCreate = sectionLetters.slice(0, numberOfSections);

    const existingSections = await Section.find({
      department,
      batch: batchId,
      sectionName: { $in: sectionsToCreate },
      academicYear
    });

    if (existingSections.length > 0) {
      const existingNames = existingSections.map(s => s.sectionName).join(', ');
      return res.status(400).json({
        success: false,
        error: `Sections ${existingNames} already exist for this batch`
      });
    }

    const sectionsData = sectionsToCreate.map(sectionName => ({
      sectionName,
      department,
      batch: batchId,
      year,
      academicYear,
      capacity: capacity || 60
    }));
     
    const createdSections = await Section.insertMany(sectionsData);
  
    const populatedSections = await Section.find({ _id: { $in: createdSections.map(s => s._id) } })
      .populate('department', 'departmentName')
      .populate('batch', 'batchName')
      .sort({ sectionName: 1 });

    res.status(201).json({success: true,data: populatedSections});
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getSections = async (req, res) => {
  try {
    const { department, batch, year, academicYear, isActive } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (batch) filter.batch = batch;
    if (year) filter.year = parseInt(year);
    if (academicYear) filter.academicYear = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const sections = await Section.find(filter)
      .populate('department', 'departmentName')
      .populate('batch', 'batchName')
      .sort({ sectionName: 1, academicYear: -1 });

    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSectionsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { academicYear } = req.query;

    const filter = { batch: batchId };
    if (academicYear) filter.academicYear = academicYear;

    const sections = await Section.find(filter)
      .populate('department', 'departmentName')
      .populate('batch', 'batchName')
      .sort({ sectionName: 1 });

    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('department', 'departmentName')
      .populate('batch', 'batchName');

    if (!section) {
      return res.status(404).json({ success: false, error: 'Section not found' });
    }

    res.json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const { sectionName, capacity, isActive } = req.body;
    const updateData = {};

    if (sectionName) updateData.sectionName = sectionName;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (isActive !== undefined) updateData.isActive = isActive;

    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('department', 'departmentName')
      .populate('batch', 'batchName');

    if (!section) {
      return res.status(404).json({ success: false, error: 'Section not found' });
    }

    res.json({ success: true, data: section });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!section) {
      return res.status(404).json({ success: false, error: 'Section not found' });
    }

    res.json({ success: true, message: 'Section deactivated successfully', data: section });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
