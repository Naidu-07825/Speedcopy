const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {    
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null, 
    },    
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser; 
      },
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "printer", "delivery", "admin"],
      default: "user",
    },    
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyOtp: {
      type: String,
      default: null,
    },
    emailVerifyOtpExpire: {
      type: Number,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLastSentAt: {
      type: Number,
      default: null,
    },    
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpire: {
      type: Number,
      default: null,
    },    
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: String,
      default: null,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", UserSchema);