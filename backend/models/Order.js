const mongoose = require("mongoose");
const ItemSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
  },
  fileName: String,
  pages: Number,
  copies: Number,
  quantity: Number,
  color: String,
  size: String,
  sides: String,
  binding: String,
  lamination: Boolean,
  urgent: Boolean,
  frameType: String,
  finish: String,
  printSide: String,
  mugType: String,
  price: Number,
  unitprice: Number,
  filePath: String, 
  filePaths: [String], 
  fileNames: [String], 
});
const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [ItemSchema],
    delivery: {
      name: String,
      phone: String,
      address: String,
      email: String,
    },    
    assignedPrinter: {
      type: String, 
      default: null,
    },
    assignedDelivery: {
      type: String, 
      default: null,
    },   
    deliveryOtp: String,
    deliveryOtpPlain: String,
    otpVerified: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },    
    paymentId: {
      type: String,
      default: null, 
    },
    paymentType: String,    
    totalPrice: {
      type: Number,
      required: true,
    },    
    urgent: {
      type: Boolean,
      default: false,
    },    
    isPreBooking: {
      type: Boolean,
      default: false,
    },
    scheduledDate: {
      type: String,
    },
    scheduledTime: {
      type: String, 
    },
    preBookingDiscount: {
      type: Number,
      default: 0,
    },    
    promo: {
      type: {
        id: mongoose.Schema.Types.ObjectId,
        code: String,
        discount: Number,
      },
      default: null,
    },
    discount: {
      type: Number,
      default: 0,
    },    
    pointsRedeemed: {
      type: Number,
      default: 0,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Printing",
        "Ready",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Order", OrderSchema);