import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
  },
  image: {
    type: String,
    default:
      "https://res.cloudinary.com/djtjlvuvb/image/upload/v1743689703/nmeez0cw52s8wlqhi8yw.jpg",
  },
  otpExpiredAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("User", userSchema);
