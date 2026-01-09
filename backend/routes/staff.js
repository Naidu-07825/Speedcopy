const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");
const roleAuth = require("../middleware/roleAuth");
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const sendEmail = require("../utils/sendEmail");
const awardLoyaltyPoints = require("../utils/awardLoyaltyPoints");


router.get(
  "/printer/orders",
  roleAuth(["printer"]),
  async (req, res) => {
    try {
      const showPool = req.query.pool === "true";
      const showReady = req.query.showReady === "true";
      const statuses = ["Pending", "Printing"];
      if (showReady) statuses.push("Ready");

      const filter = {
        status: { $in: statuses },
        $or: showPool
          ? [{ assignedPrinter: null }]
          : [{ assignedPrinter: req.user.id }, { assignedPrinter: req.user.id }, { assignedPrinter: null }],
      };

      
      if (!showPool) {
        filter.$or = [{ assignedPrinter: req.user.id }, { assignedPrinter: null }];
      }

      const orders = await Order.find(filter).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      console.error("PRINTER LIST ERROR:", err);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  }
);


router.put(
  "/printer/orders/:id/start",
  roleAuth(["printer"]),
  async (req, res) => {
    try {
      
      const order = await Order.findOneAndUpdate(
        { _id: req.params.id, status: "Pending", $or: [{ assignedPrinter: req.user.id }, { assignedPrinter: null }] },
        { $set: { status: "Printing", assignedPrinter: req.user.id } },
        { new: true }
      );

      if (!order) return res.status(404).json({ message: "Order not found or cannot be started" });

      if (order.userId) {
        await Notification.create({
          user: order.userId,
          title: "Order Printing",
          message: `Your order ${order.orderId} is being printed.`,
        });
      }

     
      if (global.io) {
        global.io.emit("order-updated", order.toObject ? order.toObject() : order);
        console.log("📡 Socket emit: order-updated", order._id, order.status);
      }

      res.json({ message: "Order set to Printing", order });
    } catch (err) {
      console.error("START PRINT ERROR:", err);
      res.status(500).json({ message: "Failed to start printing" });
    }
  }
);


router.put(
  "/printer/orders/:id/complete",
  roleAuth(["printer"]),
  async (req, res) => {
    try {
      
      const order = await Order.findOne({ _id: req.params.id });
      if (!order) return res.status(404).json({ message: "Order not found" });

      if (!["Pending", "Printing"].includes(order.status)) {
        return res.status(400).json({ message: "Order cannot be marked Ready" });
      }

      
      if (!order.assignedPrinter) {
        order.assignedPrinter = req.user.id;
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

      order.deliveryOtp = hashedOtp;
      order.deliveryOtpPlain = otp;
      order.status = "Ready";

      await order.save();

      
      const updatedOrder = await Order.findById(order._id);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found after update" });
      }

      if (updatedOrder.userId) {
        await Notification.create({
          user: updatedOrder.userId,
          title: "Order Ready",
          message: `Your order ${updatedOrder.orderId} is ready for delivery. OTP: ${otp}`,
        });
      }

     
      if (global.io) {
        const orderObj = updatedOrder.toObject ? updatedOrder.toObject() : updatedOrder;
        const publicOrder = { ...orderObj };
        delete publicOrder.deliveryOtpPlain;
        global.io.emit("order-ready", publicOrder);
        global.io.emit("order-ready-admin", orderObj);
        console.log("📡 Socket emit: order-ready (public)", orderObj._id, orderObj.status);
        console.log("📡 Socket emit: order-ready-admin (admin-only)", orderObj._id, orderObj.status);
      }

      res.json({ message: "Order marked Ready", order });
    } catch (err) {
      console.error("COMPLETE PRINT ERROR:", err);
      res.status(500).json({ message: "Failed to mark Ready" });
    }
  }
);


router.get(
  "/delivery/orders",
  roleAuth(["delivery"]),
  async (req, res) => {
    try {
      const showPool = req.query.pool === "true";

      const filter = { status: "Ready" };
      if (showPool) filter.assignedDelivery = null;
      else filter.$or = [{ assignedDelivery: req.user.id }, { assignedDelivery: null }];

      const orders = await Order.find(filter).sort({ updatedAt: -1 });
      res.json(orders);
    } catch (err) {
      console.error("DELIVERY LIST ERROR:", err);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  }
);


router.put(
  "/delivery/orders/:id/verify-otp",
  roleAuth(["delivery"]),
  async (req, res) => {
    try {
      const { otp } = req.body;
      if (!otp || otp.length !== 4) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      
      if (order.assignedDelivery && order.assignedDelivery !== req.user.id) {
        return res.status(403).json({ message: "Order assigned to another delivery" });
      }

      const hashedInputOtp = crypto.createHash("sha256").update(otp).digest("hex");

      if (hashedInputOtp !== order.deliveryOtp) {
        return res.status(400).json({ message: "Incorrect OTP" });
      }


      order.status = "Delivered";
      order.deliveryOtp = null;
      order.deliveryOtpPlain = null;
      order.otpVerified = true;

      await order.save();

      const pointsEarned = await awardLoyaltyPoints(order);

      
      const updatedOrder = await Order.findById(order._id);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found after update" });
      }

      
      try {
        const invoicePdf = await generateInvoicePdf(updatedOrder);

        await sendEmail({
          to: updatedOrder.delivery.email,
          subject: `Invoice for Order #${updatedOrder.orderId}`,
          html: `
            <h3>🎉 Your order has been delivered!</h3>
            <p><b>Order ID:</b> ${updatedOrder.orderId}</p>
            <p><b>Order Value:</b> ₹${updatedOrder.totalPrice}</p>
            ${pointsEarned > 0 ? `<p><b>⭐ Loyalty Points Earned:</b> ${pointsEarned} points</p>` : ''}
            <p>Your GST invoice is attached.</p>
            <p>Thank you for choosing <b>Speedcopy</b>.</p>
          `,
          attachments: [
            {
              filename: `invoice-${updatedOrder.orderId}.pdf`,
              content: invoicePdf,
            },
          ],
        });
      } catch (err) {
        console.warn("Invoice/email sending failed after OTP verification:", err.message || err);
      }

      
      if (updatedOrder.userId) {
        await Notification.create({
          user: updatedOrder.userId,
          title: "Order Delivered",
          message: `Your order ${updatedOrder.orderId} has been delivered.${pointsEarned > 0 ? ` You earned ${pointsEarned} loyalty points!` : ''}`,
        });
      }

      
      if (global.io) {
        global.io.emit("order-delivered", updatedOrder.toObject ? updatedOrder.toObject() : updatedOrder);
        console.log("📡 Socket emit: order-delivered", updatedOrder._id, updatedOrder.status);
      }

      res.json({ message: "Order delivered successfully" });
    } catch (err) {
      console.error("DELIVERY VERIFY ERROR:", err);
      res.status(500).json({ message: "OTP verification failed" });
    }
  }
);

router.post(
  "/printer/orders/:id/claim",
  roleAuth(["printer"]),
  async (req, res) => {
    try {
      const order = await Order.findOneAndUpdate(
        { _id: req.params.id, status: "Pending", assignedPrinter: null },
        { $set: { assignedPrinter: req.user.id } },
        { new: true }
      );

      if (!order) return res.status(400).json({ message: "Order cannot be claimed" });

      res.json({ message: "Order claimed", order });
    } catch (err) {
      console.error("CLAIM ERROR:", err);
      res.status(500).json({ message: "Failed to claim" });
    }
  }
);


router.post(
  "/delivery/orders/:id/claim",
  roleAuth(["delivery"]),
  async (req, res) => {
    try {
      const order = await Order.findOneAndUpdate(
        { _id: req.params.id, status: "Ready", assignedDelivery: null },
        { $set: { assignedDelivery: req.user.id } },
        { new: true }
      );

      if (!order) return res.status(400).json({ message: "Order cannot be claimed" });

      res.json({ message: "Order claimed", order });
    } catch (err) {
      console.error("DELIVERY CLAIM ERROR:", err);
      res.status(500).json({ message: "Failed to claim" });
    }
  }
);

module.exports = router;
