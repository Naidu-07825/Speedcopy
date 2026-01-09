const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const jwt = require("jsonwebtoken");


const authUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};


router.post("/contact", authUser, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message required" });
  }

  const complaint = await Complaint.create({
    user: req.user.id,
    message,
  });

  res.status(201).json({
    message: "Complaint sent successfully",
  });
});

module.exports = router;
