const express = require("express");
const Order = require("../models/Order");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();


router.get("/", adminAuth, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});


router.put("/:id", adminAuth, async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  res.json(order);
});

module.exports = router;
