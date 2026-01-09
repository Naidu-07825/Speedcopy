require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

mongoose.connect(process.env.MONGO_URI);

async function resetAdmin() {
  const email = "admin@xerox.com";
  const password = "admin123"; 

  await Admin.deleteMany({ email });


  await Admin.create({
    email,
    password,
  });

  console.log("✅ Admin created successfully");
  console.log("Email:", email);
  console.log("Password:", password);

  process.exit();
}

resetAdmin();
