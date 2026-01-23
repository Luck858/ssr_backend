import Batch from '../models/Batch.js';
import Department from '../models/Departement.js';
import Semester from '../models/Semester.js';
import Course from '../models/Course.js';
// ===================== CREATE BATCH =====================
export const createBatch = async (req, res) => {
  try {
    const { batchName, departments,course } = req.body;

    if (!course ||!batchName || !departments || !Array.isArray(departments) || departments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Batch name course name and at least one department are required.',
      });
    }


    const courseDoc = await Course.findById(course);

if (!courseDoc) {
  return res.status(404).json({
    success: false,
    message: 'Course not found',
  });
}




    const deptIds = departments.map((d) => d.departmentId);
    const validDepartments = await Department.find({ _id: { $in: deptIds } });

    if (validDepartments.length !== departments.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more provided departments were not found.',
      });
    }

    const departmentsForBatch = departments.map((d) => {
      const dept = validDepartments.find((v) => v._id.toString() === d.departmentId);
      return {
        departmentId: dept._id,
        departmentName: dept.departmentName,
        numberOfSections: d.numberOfSections,
      };
    });

    // Force exactly 3 academic years for the batch.
    // If batchName contains start-end (e.g. 2025-2028), use the start year; otherwise use current year.
    let startDate = null, endDate = null;
    let academicYears = [];
    let startYear;
    if (batchName.includes('-')) {
      const parts = batchName.split('-').map(Number);
      startYear = parts[0];
    } else {
      startYear = new Date().getFullYear();
    }
    // Build exactly 3 academic year strings starting from startYear
    for (let i = 0; i < 3; i++) {
      const sy = startYear + i;
      const ey = sy + 1;
      academicYears.push(`${sy}-${ey}`);
    }
    startDate = new Date(startYear, 0, 1);
    endDate = new Date(startYear + 2, 11, 31);

const batch = await Batch.create({
  batchName,
  course: {
    courseId: courseDoc._id,
    courseName: courseDoc.courseName,
  },
  departments: departmentsForBatch,
  startDate,
  endDate,
  academicYears,
});


await Department.updateMany(
  { _id: { $in: deptIds } },
  {
    $push: {
      batches: {
        batchId: batch._id,
        batchName: batch.batchName, // ✅ store snapshot name
      },
    },
  }
);

    // Create Semester documents for each department and academic year
    let createdSemesters = [];
    try {
      const semesterDocs = [];
      // For each department in this batch, create semesters for each academic year
      for (const dept of departmentsForBatch) {
        const departmentId = dept.departmentId; // ObjectId
        // We'll create 2 semesters per academic year
        for (let ayIndex = 0; ayIndex < academicYears.length; ayIndex++) {
          const academicYearStr = academicYears[ayIndex]; // e.g. '2025-2026'
          // parse start year
          const startYear = parseInt(academicYearStr.split('-')[0], 10);

          // Semester 1 of academic year: semesterNumber = ayIndex*2 + 1
          const sem1Number = ayIndex * 2 + 1;
          const sem2Number = ayIndex * 2 + 2;

          const yearForSem1 = Math.ceil(sem1Number / 2);
          const yearForSem2 = Math.ceil(sem2Number / 2);

          // Define semester date ranges: first sem Jul-Dec, second Jan-Jun
          const sem1Start = new Date(startYear, 6, 1); // July 1
          const sem1End = new Date(startYear, 11, 31); // Dec 31
          const sem2Start = new Date(startYear + 1, 0, 1); // Jan 1
          const sem2End = new Date(startYear + 1, 5, 30); // Jun 30

          semesterDocs.push({
            semesterName: `Semester ${sem1Number}`,
            semesterNumber: sem1Number,
            academicYear: academicYearStr,
            department: departmentId,
            year: yearForSem1,
            startDate: sem1Start,
            endDate: sem1End,
            isActive: false,
            isCurrent: false,
          });

          semesterDocs.push({
            semesterName: `Semester ${sem2Number}`,
            semesterNumber: sem2Number,
            academicYear: academicYearStr,
            department: departmentId,
            year: yearForSem2,
            startDate: sem2Start,
            endDate: sem2End,
            isActive: false,
            isCurrent: false,
          });
        }
      }

      if (semesterDocs.length > 0) {
        // insertMany with ordered:false to continue on duplicates
        await Semester.insertMany(semesterDocs, { ordered: false }).catch((err) => {
          // ignore duplicate key errors, log others
          if (err && err.writeErrors) {
            const other = err.writeErrors.filter(e => e.code !== 11000);
            if (other.length) console.error('Semester insert errors:', other);
          } else if (err.code && err.code !== 11000) {
            console.error('Semester insert error:', err);
          }
        });

        // Fetch semesters we care about (may include pre-existing ones for same years)
        createdSemesters = await Semester.find({
          department: { $in: deptIds },
          academicYear: { $in: academicYears }
        }).sort({ department: 1, academicYear: 1, semesterNumber: 1 });
      }
    } catch (semErr) {
      console.error('Error creating semesters for batch:', semErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: {
        batch,
        semesters: createdSemesters,
      },
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// ===================== GET ALL BATCHES =====================
export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate('departments.departmentId', 'departmentName');
    return res.status(200).json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// ===================== GET SINGLE BATCH BY ID =====================
export const getBatchById = async (req, res) => {
  try {
    
    const { batchId } = req.params; // <-- use route param
    console.log(batchId)
    const id=batchId;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Batch ID is required' });
    }

    const batch = await Batch.findById(id).populate('departments.departmentId', 'departmentName departmentImage');
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error('Error fetching batch by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// ===================== GET DEPARTMENTS UNDER A BATCH =====================
export const getDepartmentsByBatch = async (req, res) => {
  try {
    const { batchId } = req.query;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'batchId is required as a query parameter',
      });
    }

    const batch = await Batch.findById(batchId).populate('departments.departmentId', 'departmentName departmentImage');
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    const departments = batch.departments.map((d) => ({
      _id: d.departmentId._id,
      departmentName: d.departmentId.departmentName,
      departmentImage: d.departmentId.departmentImage,
      numberOfSections: d.numberOfSections,
    }));

    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error('Error fetching departments by batch:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// ===================== GET DEPARTMENT BY ID =====================
export const getDepartmentById = async (req, res) => {
  try {
    const { departmentId } = req.query;
    
    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'Department ID is required' });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({ success: true, data: department });
  } catch (error) {
    console.error('Error fetching department by ID:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
