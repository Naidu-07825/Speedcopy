const mongoose = require("mongoose");
const ComplaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    email: String,
    message: String,
    adminReply: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Complaint", ComplaintSchema);