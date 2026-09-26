import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const users = await User.find({}, '-password -PasswordHash');
    console.log(users.length, "users found via Mongoose");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
