import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'upendra201@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin account already exists!');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin@2025',
      role: 'admin',
      department: 'Administration',
      phone: '1234567890',
      isActive: true,
    });

    console.log('Admin account created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${admin.password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
