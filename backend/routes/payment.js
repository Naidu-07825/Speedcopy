const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Order = require("../models/Order");
const sendSMS = require("../utils/sendSMS");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ======================================
   CREATE STRIPE CHECKOUT SESSION
====================================== */
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID missing" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.totalPrice || order.totalPrice < 50) {
      return res.status(400).json({
        message: "Minimum payable amount is ₹50",
      });
    }

    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({
        message: "FRONTEND_URL not configured",
      });
    }

    // 🔒 Prevent duplicate Stripe sessions for already-paid orders
    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        message: "Order already paid",
      });
    }

    const amount = Math.round(order.totalPrice * 100); // INR → paise

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Xerox Shop Order #${order.orderId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order._id.toString(), // 🔑 used during verification
      },
      success_url: `${process.env.FRONTEND_URL}/success/${order.orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ STRIPE SESSION ERROR:", err);
    res.status(500).json({
      message: err?.raw?.message || err.message || "Stripe checkout failed",
    });
  }
});

/* ======================================
   VERIFY PAYMENT (CRITICAL STEP)
====================================== */
router.get("/verify", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID missing in session" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Idempotent update (safe to call multiple times)
    if (order.paymentStatus !== "Paid") {
      order.paymentStatus = "Paid";
      order.paymentId = session.id;
      await order.save();

      // 📲 SMS confirmation (only once)
      await sendSMS(
        order.delivery.phone,
        `Payment Successful!
Order ID: ${order.orderId}
Amount: ₹${order.totalPrice}
Thank you for choosing SpeedCopy.`
      );
    }

    res.json({
      message: "Payment verified successfully",
      order,
    });
  } catch (err) {
    console.error("❌ STRIPE VERIFY ERROR:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

module.exports = router;
