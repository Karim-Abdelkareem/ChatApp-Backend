import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendEmail = async (email, otp, type = "signup") => {
  const confirmUrl = `${process.env.CLIENT_URL}/confirm?email=${email}&otp=${otp}`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: type === "signup" ? "Confirm Your Email" : "Login OTP",
    html:
      type === "signup"
        ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome!</h2>
        <p>Thank you for signing up. Please confirm your email by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            تأكيد البريد الإلكتروني
          </a>
        </div>
          <p>Or you can use the following OTP:</p>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This link is valid for 10 minutes only.</p>
        <p>If you did not create this account, please ignore this email.</p>
      </div>
    `
        : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Login OTP</h2>
        <p>You requested to login. Use the following OTP to complete the login process:</p>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes only.</p>
        <p>If you did not request to login, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error in sending email:", error);
  }
};
