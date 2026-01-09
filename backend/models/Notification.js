const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },    
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    title: {
      type: String,
      default: "Notification",
    },
    message: {
      type: String,
      required: true,
    },    
    isUrgent: {
      type: Boolean,
      default: false,
    },    
    meta: {
      type: Object,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Notification", notificationSchema);