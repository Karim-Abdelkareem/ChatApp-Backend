import express from "express";
import {
  signUp,
  confirmEmail,
  login,
  verifyLoginOTP,
  resendOTP,
  getAllUsers,
  protectedRoutes,
} from "./userController.js";

const router = express.Router();

// مسار التسجيل
router.post("/signup", signUp);

// مسار إعادة إرسال رمز التحقق
router.post("/resend-otp", resendOTP);

// مسار تأكيد البريد الإلكتروني
router.post("/confirm-email", confirmEmail);

// مسار تسجيل الدخول
router.post("/login", login);

// مسار التحقق من رمز OTP وتسجيل الدخول
router.post("/verify-login", verifyLoginOTP);

router.get("/", protectedRoutes, getAllUsers);

export default router;
