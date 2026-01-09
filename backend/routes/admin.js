const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
const Order = require("../models/Order");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");
const awardLoyaltyPoints = require("../utils/awardLoyaltyPoints");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const adminAuth = require("../middleware/adminAuth");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(403).json({ message: "Not an admin" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Admin login successful", token });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ message: "Admin login failed" });
  }
});


router.get("/users/staff", adminAuth, async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ["printer", "delivery"] },
    }).select("-password");
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch staff users" });
  }
});

router.post("/create-staff", adminAuth, async (req, res) => {
  try {
    let { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!["printer", "delivery"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Staff already exists" });
    }

    // Generate a password if not provided
    let plainPassword = password;
    if (!plainPassword || String(plainPassword).trim() === "") {
      plainPassword = Math.random().toString(36).slice(-8) + "A1";
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const staff = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role,
      isVerified: true,
    });

    // Try sending credentials via email and SMS (best-effort)
    let emailSent = false;
    let smsSent = false;

    try {
      await sendEmail({
        to: staff.email,
        subject: `Your ${role} account at Speed Copy`,
        html: `
          <p>Hi ${staff.name || staff.email},</p>
          <p>Your staff account has been created with the following credentials:</p>
          <p><b>Email:</b> ${staff.email}<br /><b>Password:</b> ${plainPassword}</p>
          <p>Login at <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}">Speed Copy</a></p>
          <p>Please change your password after first login.</p>
        `,
      });
      emailSent = true;
    } catch (err) {
      console.error("SEND EMAIL ERROR:", err.message || err);
    }

    try {
      await sendSMS(staff.phone, `Speed Copy: Your ${role} account has been created. Email: ${staff.email} Password: ${plainPassword}`);
      smsSent = true;
    } catch (err) {
      console.error("SEND SMS ERROR:", err.message || err);
    }

    res.json({
      message: `${role.toUpperCase()} created successfully`,
      staff: {
        id: staff._id,
        name: staff.name,
        role: staff.role,
        email: staff.email,
        phone: staff.phone,
      },
      password: plainPassword,
      emailSent,
      smsSent,
    });
  } catch (err) {
    console.error("CREATE STAFF ERROR:", err);
    res.status(500).json({ message: "Failed to create staff" });
  }
});


router.get("/stats", adminAuth, async (req, res) => {
  try {
    
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    
    const verifiedUsers = await User.countDocuments({
      role: "user",
      isVerified: true,
    });

    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
    }).distinct("userId");

    const recentActiveUsers = recentOrders.length;

    res.json({
      totalUsers,
      verifiedUsers,
      recentActiveUsers,
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});


router.get("/orders", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});


router.put("/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (status === "Delivered") {
      return res.status(400).json({ message: "Use OTP verification" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId) {
      await Notification.create({
        user: order.userId,
        title: "Order Status Updated",
        message: `Your order ${order.orderId} is now ${status}`,
      });
    }

    if (global.io) {
      const orderObj = order.toObject ? order.toObject() : order;
      global.io.emit("order-updated", orderObj);
      console.log("📡 Socket emit: order-updated", orderObj._id, orderObj.status);
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
});

router.put("/orders/:id/ready", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    order.deliveryOtp = hashedOtp;
    order.deliveryOtpPlain = otp;
    order.status = "Ready";
    await order.save();

    if (order.userId) {
      await Notification.create({
        user: order.userId,
        title: "Order Ready",
        message: `Your order ${order.orderId} is ready. OTP: ${otp}`,
      });
    }

   
    if (global.io) {
      const orderObj = order.toObject ? order.toObject() : order;
      global.io.emit("order-ready", orderObj);
      console.log("📡 Socket emit: order-ready", orderObj._id, orderObj.status);
    }

    res.json({ message: "Order marked Ready", otp, order });
  } catch {
    res.status(500).json({ message: "Failed to mark Ready" });
  }
});


router.put("/orders/:id/verify-otp", adminAuth, async (req, res) => {
  try {
    const { otp } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const hashedInputOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (hashedInputOtp !== order.deliveryOtp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    order.status = "Delivered";
    order.deliveryOtp = null;
    order.deliveryOtpPlain = null;
    await order.save();

    const pointsEarned = await awardLoyaltyPoints(order);

    if (order.userId) {
      await Notification.create({
        user: order.userId,
        title: "Order Delivered",
        message: `Order delivered. Points earned: ${pointsEarned}`,
      });
    }

    if (global.io) {
      const orderObj = order.toObject ? order.toObject() : order;
      global.io.emit("order-delivered", orderObj);
      console.log("📡 Socket emit: order-delivered", orderObj._id, orderObj.status);
    }

    res.json({ message: "Order delivered", pointsEarned });
  } catch {
    res.status(500).json({ message: "OTP verification failed" });
  }
});


router.put("/orders/:id/cancel", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Cannot cancel delivered order" });
    }

    order.status = "Cancelled";
    await order.save();

    if (order.userId) {
      await Notification.create({
        user: order.userId,
        title: "Order Cancelled",
        message: `Your order ${order.orderId} was cancelled`,
      });
    }

    
    if (global.io) {
      const orderObj = order.toObject ? order.toObject() : order;
      global.io.emit("order-updated", orderObj);
      console.log("📡 Socket emit: order-updated", orderObj._id, orderObj.status);
    }

    res.json({ message: "Order cancelled" });
  } catch {
    res.status(500).json({ message: "Cancel failed" });
  }
});


router.delete("/orders/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    for (const item of order.items || []) {
      if (item.filePath) {
        try {
          await fs.unlink(path.join(__dirname, "..", item.filePath));
        } catch {}
      }
    }

    await Order.findByIdAndDelete(req.params.id);

   
    if (global.io) {
      global.io.emit("order-deleted", { _id: req.params.id });
    }

    res.json({ message: "Order deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});


router.get("/complaints", adminAuth, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch {
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// List all users (admin)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("FETCH USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Delete a user (admin)
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    // Remove notifications for that user
    await Notification.deleteMany({ user: targetId });

    // Detach user from orders
    await Order.updateMany({ userId: targetId }, { $unset: { userId: "" } });

    await User.findByIdAndDelete(targetId);

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("ADMIN DELETE USER ERROR:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

router.put("/complaints/:id/resolve", adminAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "Resolved";
    await complaint.save();

    if (complaint.user) {
      await Notification.create({
        user: complaint.user,
        title: "Support Update",
        message: "Your complaint has been resolved",
      });
    }

    res.json({ message: "Complaint resolved" });
  } catch {
    res.status(500).json({ message: "Resolve failed" });
  }
});

module.exports = router;
