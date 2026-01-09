const Promotion = require("../models/Promotion");
module.exports = async (req, res, next) => {
  try {
    const promoCode = req.body.promoCode || req.body.promo;
    if (!promoCode) return next();
    const promo = await Promotion.findOne({ code: promoCode.toUpperCase() });
    if (!promo) return res.status(400).json({ message: "Invalid promo code" });
    const cart = req.body.cart || [];
    const total = Number(req.body.total || 0);
    const check = promo.isValidFor({ userId: req.user ? req.user.id : null, orderTotal: total, cartItems: cart });
    if (!check.valid) return res.status(400).json({ message: `Promo invalid: ${check.reason}` });
    const discount = promo.calculateDiscount({ orderTotal: total });
    req.promo = promo;
    req.promoDiscount = discount;
    req.totalAfterPromo = Math.max(0, total - discount);
    next();
  } catch (err) {
    console.error("❌ PROMO MIDDLEWARE ERROR:", err);
    res.status(500).json({ message: "Server error validating promo" });
  }
};