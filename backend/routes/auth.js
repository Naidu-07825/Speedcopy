const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post("/register", async (req, res) => {
  try {
    const { name, phone, password, referralCode } = req.body;
    const email = req.body.email?.toLowerCase();

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userReferralCode =
      "SC" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user",
      isVerified: false,
      emailVerifyOtp: hashedOtp,
      emailVerifyOtpExpire: Date.now() + 10 * 60 * 1000,
      referralCode: userReferralCode,
      loyaltyPoints: 0,
    });

    await user.save();

    
    if (referralCode) {
      const referrer = await User.findOne({
        referralCode: referralCode.trim().toUpperCase(),
      });

      if (referrer && referrer.email !== email) {
        referrer.loyaltyPoints += 50;
        user.loyaltyPoints += 25;
        user.referredBy = referrer.referralCode;
        await referrer.save();
        await user.save();
      }
    }

    if (!process.env.SKIP_EMAIL) {
      await sendEmail({
        to: email,
        subject: "Verify Your Email - OTP",
        html: `<h3>Your OTP is <b>${otp}</b></h3><p>Valid for 10 minutes</p>`,
      });
    }

    res.status(201).json({
      message: "Registered successfully. Please verify your email.",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});


router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.emailVerifyOtpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOtp !== user.emailVerifyOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.emailVerifyOtp = undefined;
    user.emailVerifyOtpExpire = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified && !user.isGoogleUser) {
      return res
        .status(403)
        .json({ message: "Please verify your email before login" });
    }

    if (!user.isGoogleUser) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.referralCode) {
      user.referralCode =
        "SC" + Math.random().toString(36).substring(2, 8).toUpperCase();
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,        
        isGoogleUser: user.isGoogleUser,
        referralCode: user.referralCode,
        loyaltyPoints: user.loyaltyPoints,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});


router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Missing Google token" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        role: "user",
        isVerified: true,
        isGoogleUser: true,
        referralCode:
          "SC" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        loyaltyPoints: 0,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
  message: "Google login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,          
    isGoogleUser: user.isGoogleUser,
    referralCode: user.referralCode,
    loyaltyPoints: user.loyaltyPoints,
  },
});
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
});


router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = crypto.createHash("sha256").update(otp).digest("hex");
    user.resetOtpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: `<h3>Your OTP is ${otp}</h3>`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (user.resetOtp !== hashedOtp || user.resetOtpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
});

router.get("/", (req, res) => {
  res.json({
    message: "Auth endpoint",
    routes: [
      "POST /register",
      "POST /verify-email-otp",
      "POST /login",
      "POST /google",
      "POST /forgot-password",
      "POST /reset-password"
    ]
  });
});

module.exports = router;
