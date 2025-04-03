import userModel from "./userModel.js";
import catchAsync from "../../middleware/catchAsync.js";
import AppError from "../../utils/appError.js";
import { sendEmail, generateOTP } from "../../mails/email.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";

export const signUp = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  let user = await userModel.findOne({ email: email });

  if (user) {
    if (!user.active) {
      // إذا كان المستخدم موجود ولكن غير مفعل، نتحقق من انتهاء صلاحية OTP
      if (!user.otpExpiredAt || user.otpExpiredAt < Date.now()) {
        // إذا انتهت صلاحية OTP، نقوم بإعادة إرساله
        const otp = generateOTP();
        const otpExpiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpiredAt = otpExpiredAt;
        await user.save();

        await sendEmail(email, otp);

        return res.status(200).json({
          status: "success",
          message: "OTP Resent to Your Email",
        });
      }
      return next(new AppError("Check Your Email", 400));
    }
    return next(new AppError("Email Already Exists", 400));
  }

  const otp = generateOTP();
  const otpExpiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user = await userModel.create({
    name,
    email,
    otp,
    otpExpiredAt,
  });

  await sendEmail(email, otp);

  return res.status(201).json({
    status: "success",
    message: "User Created Successfully Please Check Your Email",
  });
});

export const resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new AppError("Email Not Found", 404));
  }

  if (user.active) {
    return next(new AppError("This Account is Already Active", 400));
  }

  const otp = generateOTP();
  const otpExpiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = otp;
  user.otpExpiredAt = otpExpiredAt;
  await user.save();

  await sendEmail(email, otp);

  return res.status(200).json({
    status: "success",
    message: "OTP Resent to Your Email",
  });
});

export const confirmEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await userModel.findOne({
    email,
    otp,
    otpExpiredAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("OTP is invalid or expired", 400));
  }

  user.active = true;
  user.otp = undefined;
  user.otpExpiredAt = undefined;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Email Confirmed Successfully",
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new AppError("Email Not Found", 404));
  }

  if (!user.active) {
    return next(new AppError("Please Confirm Your Email First", 400));
  }

  const otp = generateOTP();
  const otpExpiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = otp;
  user.otpExpiredAt = otpExpiredAt;
  await user.save();

  await sendEmail(email, otp, "login");

  return res.status(200).json({
    status: "success",
    message: "OTP Sent to Your Email",
  });
});

export const verifyLoginOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await userModel.findOne({
    email,
    otp,
    otpExpiredAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("OTP is invalid or expired", 400));
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name, image: user.image },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  user.otp = undefined;
  user.otpExpiredAt = undefined;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Login Successfully",
    accessToken: token,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userModel.find({
    active: true,
    _id: { $ne: req.user._id },
  });
  res.status(200).json({
    status: "success",
    data: users,
  });
});

export const protectedRoutes = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(new AppError("Please Provide a Valid Token", 401));
  }
  const decoded = await promisify(jwt.verify)(
    authorization,
    process.env.JWT_SECRET
  );
  let user = await userModel.findById(decoded.id);
  if (!user) {
    return next(new AppError("User Not Found", 404));
  }
  req.user = user;
  next();
});
