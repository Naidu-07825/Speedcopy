const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const auth = require("../middleware/userAuth");


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/avatars"),
  filename: (req, file, cb) =>
    cb(
      null,
      req.user.id + "-" + Date.now() + path.extname(file.originalname)
    ),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});


router.get("/notifications", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    const mapped = notifications.map((n) => {
      const obj = n.toObject();
      obj.read = !!obj.isRead;
      return obj;
    });

    res.json(mapped);
  } catch (err) {
    console.error("NOTIFICATION FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});



router.put("/notifications/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("READ ALL NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: "Failed to mark notifications" });
  }
});



router.put("/update", auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        referralCode: updatedUser.referralCode,
        loyaltyPoints: updatedUser.loyaltyPoints,
        isGoogleUser: updatedUser.isGoogleUser,
      },
    });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
});



router.put(
  "/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      
      if (user.isGoogleUser) {
        return res.status(403).json({
          message: "Google users cannot change profile photo",
        });
      }

      
      if (user.avatar) {
        const oldPath = path.join(__dirname, "..", user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

     
      user.avatar = `/uploads/avatars/${req.file.filename}`;
      await user.save();

      res.json({
        message: "Profile picture updated",
        avatar: user.avatar,
      });
    } catch (err) {
      console.error("AVATAR UPLOAD ERROR:", err);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  }
);


router.put("/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isGoogleUser) {
      return res.status(403).json({
        message: "Google users cannot change password",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// Delete own account
router.delete("/delete", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove notifications
    await Notification.deleteMany({ user: userId });

    // Detach from orders (preserve order history)
    await Order.updateMany({ userId }, { $unset: { userId: "" } });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted" });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;
