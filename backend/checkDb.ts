import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const db = mongoose.connection.db;
    const users = await db?.collection('users').find({}).toArray();
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
