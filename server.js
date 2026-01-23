import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import DB connection and routes
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import registrationRoutes from './routes/registration.js';
import departmentRoutes from './routes/department.js';
import heroCarouselRoutes from './routes/heroCarousel.js';
import subjectRoutes from './routes/subjects.js';
import teacherAllocationRoutes from './routes/teacherAllocations.js';
import timetableRoutes from './routes/timetablepage.js';
import attendanceRoutes from './routes/attendance.js';
import batchRoutes from './routes/batch.js';
import semesterRoutes from './routes/semester.js';
import courseRoutes from './routes/course.js';
import feeRoutes from "./routes/feeRoutes.js";
import facultyRoutes from './routes/facultyRoutes.js';
import sectionRoutes from './routes/sections.js';
import recruiterRoutes from "./routes/recruiterRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import foldersRouter from './routes/folders.js';
import resumesRouter from './routes/resumes.js';
import problemsRouter from './routes/problems.js';
import studentRouter from './routes/studentRoutes.js';
import applicationRoutes from './routes/application.js';
import fileUploadRoutes from './routes/files.js';
import coordinatorRoutes from './routes/coordinators.js';









// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ensure upload folder exists
const heroUploadPath = path.join(__dirname, 'uploads/hero');
if (!fs.existsSync(heroUploadPath)) {
  fs.mkdirSync(heroUploadPath, { recursive: true });
  console.log('✅ Created upload folder:', heroUploadPath);
}

// Serve uploaded images statically


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'College Management System API is running!',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', registrationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/hero-carousel', heroCarouselRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/teacher", facultyRoutes); 
app.use("/api/gallery", galleryRoutes);
app.use('/api/student', studentRouter);
app.use('/api/coordinators', coordinatorRoutes);
app.get("/api/placements", (req, res) => {
  const data = [
    {
      year: "2024",
      records: [
        { company: "TCS", placed: 120, package: 5.5 },
        { company: "Infosys", placed: 90, package: 4.8 },
        { company: "Wipro", placed: 75, package: 4.2 },
      ],
    },
    {
      year: "2023",
      records: [
        { company: "Amazon", placed: 12, package: 18 },
        { company: "Cognizant", placed: 100, package: 4.5 },
        { company: "HCL", placed: 65, package: 3.8 },
      ],
    },
  ];
  res.json(data);
});
app.use('/api/subjects', subjectRoutes);
app.use('/api/teacher-allocations', teacherAllocationRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', courseRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/folders', foldersRouter);
app.use('/api/resumes', resumesRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/files', fileUploadRoutes);
app.use('/api/applications', applicationRoutes);

app.use('/api/sections', sectionRoutes);
// 404 route for unknown endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
  });
});

// Start server
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
