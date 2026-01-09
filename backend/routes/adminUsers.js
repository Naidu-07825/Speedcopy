const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const adminAuth = require("../middleware/adminAuth");


router.post(
  "/users/create-staff",
  adminAuth,
  async (req, res) => {
    try {
      const { name, email, phone, password, role } = req.body;

      if (!name || !email || !phone || !password || !role) {
        return res.status(400).json({ message: "All fields required" });
      }

      if (!["printer", "delivery"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const staff = await User.create({
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role,
        isVerified: true,
      });

      res.json({
        message: "Staff created successfully",
        staff: {
          id: staff._id,
          name: staff.name,
          role: staff.role,
        },
      });
    } catch (err) {
      console.error("CREATE STAFF ERROR:", err);
      res.status(500).json({ message: "Failed to create staff" });
    }
  }
);


module.exports = router;
