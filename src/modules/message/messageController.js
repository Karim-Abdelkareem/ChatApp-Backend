import catchAsync from "../../middleware/catchAsync.js";
import messageModel from "./messageModel.js";
import AppError from "../../utils/AppError.js";

export const sendMessage = catchAsync(async (req, res, next) => {
  const { message, sender, receiver } = req.body;

  if (!sender || !receiver || !message) {
    return next(
      new AppError("All fields (sender, receiver, message) are required", 400)
    );
  }

  const newMessage = await messageModel.create({ message, sender, receiver });

  // Emit new message event via Socket.io (if using it)
  const io = req.app.get("io"); // Assuming you've attached `io` to `req.app`
  if (io) {
    io.to(receiver).emit("receive_private_message", newMessage);
  }

  res.status(201).json({
    status: "success",
    message: "Message Sent Successfully",
    data: newMessage,
  });
});

export const getMessages = catchAsync(async (req, res, next) => {
  const { senderId, receiverId } = req.params;

  if (!senderId || !receiverId) {
    return next(new AppError("Sender and receiver IDs are required", 400));
  }

  const messages = await messageModel
    .find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
    .sort({ createdAt: 1 }); // Sort messages from oldest to newest

  res.status(200).json({
    status: "success",
    data: messages,
  });
});
