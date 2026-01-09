const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Promotion = require("../models/Promotion");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");

const userAuth = require("../middleware/userAuth");
const adminAuth = require("../middleware/adminAuth");

const multer = require("multer");
const path = require("path");

const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const awardLoyaltyPoints = require("../utils/awardLoyaltyPoints");

/* ===============================
   MULTER CONFIG
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    ),
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

/* ===============================
   CREATE ORDER
================================ */
router.post("/", userAuth, upload.array("files"), async (req, res) => {
  try {
    const {
      cart,
      delivery,
      paymentType,
      promoCode,
      isPreBooking,
      scheduledDate,
      scheduledTime,
      usePoints,
      urgent,
    } = req.body;

    if (!cart || !delivery)
      return res.status(400).json({ message: "Missing cart or delivery" });

    if (paymentType !== "stripe")
      return res.status(400).json({ message: "Only Stripe allowed" });

    const parsedCart = typeof cart === "string" ? JSON.parse(cart) : cart;
    const parsedDelivery =
      typeof delivery === "string" ? JSON.parse(delivery) : delivery;

    let totalPrice = parsedCart.reduce(
      (sum, i) => sum + Number(i.price || 0),
      0
    );

    const originalTotal = totalPrice;
    const user = await User.findById(req.user.id);

    /* ---------- Pre-Booking Discount ---------- */
    let preBookingDiscount = 0;
    if (isPreBooking === "true") {
      preBookingDiscount = Math.round(totalPrice * 0.1);
      totalPrice -= preBookingDiscount;
    }

    /* ---------- Loyalty Points ---------- */
    let pointsRedeemed = 0;
    if (usePoints === "true" && user?.loyaltyPoints > 0) {
      const maxRedeem = totalPrice * 0.2;
      pointsRedeemed = Math.min(user.loyaltyPoints, maxRedeem);
      totalPrice -= pointsRedeemed;
      user.loyaltyPoints -= pointsRedeemed;
      await user.save();
    }

    /* ---------- Promo Code ---------- */
    let discount = 0;
    let appliedPromo = null;

    if (promoCode) {
      const promo = await Promotion.findOne({
        code: promoCode.toUpperCase(),
      });

      if (!promo)
        return res.status(400).json({ message: "Invalid promo code" });

      const check = promo.isValidFor({
        userId: req.user.id,
        orderTotal: originalTotal,
        cartItems: parsedCart,
      });

      if (!check.valid)
        return res.status(400).json({ message: check.reason });

      discount = promo.calculateDiscount({
        orderTotal: originalTotal,
      });

      totalPrice -= discount;

      appliedPromo = {
        id: promo._id,
        code: promo.code,
        discount,
      };
    }

    /* ---------- File Mapping ---------- */
    const files = req.files || [];
    let pointer = 0;

    const items = parsedCart.map((item) => {
      if (!item.pages || !item.copies) {
        return { ...item, filePath: null, fileName: null };
      }

      const file = files[pointer];
      pointer++;

      return {
        ...item,
        filePath: file ? `/uploads/${file.filename}` : null,
        fileName: file ? file.originalname : null,
      };
    });

    /* ---------- CREATE ORDER ---------- */
    const isUrgent = urgent === "true";

    const order = await Order.create({
      orderId: Math.floor(1000 + Math.random() * 9000).toString(),
      userId: req.user.id,
      items,
      delivery: parsedDelivery,

      paymentMethod: paymentType,
      paymentType,

      totalPrice,
      urgent: isUrgent,
      isPreBooking: isPreBooking === "true",
      scheduledDate,
      scheduledTime,

      preBookingDiscount,
      pointsRedeemed,
      pointsEarned: 0,

      promo: appliedPromo,
      discount,
      status: "Pending",
    });

    /* ---------- URGENT NOTIFICATION ---------- */
    if (isUrgent) {
      const admins = await Admin.find();
      for (const admin of admins) {
        await Notification.create({
          admin: admin._id,
          title: "Urgent Order",
          message: `Order ${order.orderId} is urgent`,
          isUrgent: true,
        });
      }
    }

    res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({
      message: err.message,
      error: err.name,
    });
  }
});

/* ===============================
   USER ORDERS
================================ */
router.get("/my-orders", userAuth, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

/* ===============================
   CANCEL ORDER
================================ */
router.put("/cancel/:orderId", userAuth, async (req, res) => {
  const order = await Order.findOne({
    orderId: req.params.orderId,
    userId: req.user.id,
  });

  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = "Cancelled";
  await order.save();

  res.json({ message: "Order cancelled" });
});

/* ===============================
   ADMIN: OUT FOR DELIVERY
================================ */
router.put(
  "/admin/out-for-delivery/:orderId",
  adminAuth,
  async (req, res) => {
    try {
      const order = await Order.findOne({ orderId: req.params.orderId });
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.status = "Out for Delivery";
      await order.save();

      await sendSMS(
        order.delivery.phone,
        `🚚 Your order is out for delivery!
Order ID: ${order.orderId}
Amount: ₹${order.totalPrice}
– SpeedCopy`
      );

      res.json({ message: "Out for delivery", order });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed" });
    }
  }
);

/* ===============================
   ADMIN: DELIVER ORDER
================================ */
router.put("/admin/deliver/:orderId", adminAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "Delivered";
    await order.save();

    const pointsEarned = await awardLoyaltyPoints(order);
    const invoice = await generateInvoicePdf(order);

    await sendEmail({
      to: order.delivery.email,
      subject: `Invoice #${order.orderId}`,
      html: `<h3>Your order has been delivered</h3>`,
      attachments: [
        { filename: `invoice-${order.orderId}.pdf`, content: invoice },
      ],
    });

    res.json({ message: "Delivered", pointsEarned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delivery failed" });
  }
});

/* ===============================
   GET ORDER BY ID
================================ */
router.get("/:orderId", async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

module.exports = router;
