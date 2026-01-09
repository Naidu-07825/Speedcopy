require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
  const email = "admin@xerox.com";
  const password = "admin123";

  const exists = await Admin.findOne({ email });
  if (exists) {
    console.log("❌ Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("✅ Admin created successfully");
  process.exit();
}

createAdmin();
