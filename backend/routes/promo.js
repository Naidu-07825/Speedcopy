const express = require("express");
const router = express.Router();
const Promotion = require("../models/Promotion");
const adminAuth = require("../middleware/adminAuth");


router.post("/", adminAuth, async (req, res) => {
  try {
    const data = req.body;
    data.code = data.code && data.code.toUpperCase();
    data.createdBy = req.user.id;

    const promo = await Promotion.create(data);
    res.status(201).json(promo);
  } catch (err) {
    console.error("❌ CREATE PROMO ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) {
    console.error("❌ LIST PROMOS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch promos" });
  }
});


router.post("/apply", async (req, res) => {
  try {
    const { code, userId, cart, total } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, reason: "Promo code required" });
    }

    const promo = await Promotion.findOne({ code: code.toUpperCase() });
    if (!promo) {
      return res.status(200).json({ valid: false, reason: "Promo code not found" });
    }

    const orderTotal = Number(total || 0);
    const cartItems = Array.isArray(cart) ? cart : [];

    const check = promo.isValidFor({ userId, orderTotal, cartItems });
    if (!check.valid) {
      return res.status(200).json({ valid: false, reason: check.reason });
    }

    const discount = promo.calculateDiscount({ orderTotal });
    const newTotal = Math.max(0, orderTotal - discount);

    res.json({ valid: true, discount, newTotal, promo: { id: promo._id, code: promo.code, type: promo.type } });
  } catch (err) {
    console.error("❌ APPLY PROMO ERROR:", err);
    res.status(500).json({ valid: false, reason: "Server error: " + err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) return res.status(404).json({ message: "Promo not found" });
    res.json(promo);
  } catch (err) {
    console.error("❌ FETCH PROMO ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:id", adminAuth, async (req, res) => {
  try {
    const data = req.body;
    if (data.code) data.code = data.code.toUpperCase();
    const promo = await Promotion.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!promo) return res.status(404).json({ message: "Promo not found" });
    res.json(promo);
  } catch (err) {
    console.error("❌ UPDATE PROMO ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});


router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ message: "Promo not found" });
    res.json({ message: "Promo deleted" });
  } catch (err) {
    console.error("❌ DELETE PROMO ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
