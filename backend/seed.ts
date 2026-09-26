import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const email = 'admin@gmail.com';
    const password = 'AdminPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const db = mongoose.connection.db;
    if (db) {
      await db.collection('users').insertOne({
        name: 'System Admin',
        email,
        Email: email, // Set legacy field to avoid unique index issues
        password: hashedPassword,
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin user seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    process.exit(0);
  }
}

seed();
