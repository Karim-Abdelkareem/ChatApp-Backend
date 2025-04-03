import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");
  } catch (e) {
    console.error("Error connecting to MongoDB:", e);
  }
};

export default dbConnection;
