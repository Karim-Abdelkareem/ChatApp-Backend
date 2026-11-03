import mongoose from "mongoose";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");
  } catch (e) {
    console.error("Error connecting to MongoDB:", e);
  }
};

export default dbConnection;

