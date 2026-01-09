const mongoose = require("mongoose");
const PromotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ["percentage", "fixed", "free_shipping", "bogo"], required: true },
    value: { type: Number, default: 0 }, 
    maxDiscount: { type: Number },
    minOrderValue: { type: Number, default: 0 },    
    usageLimit: { type: Number }, 
    perUserLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    userUsage: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],    
    applicableTo: {
      type: String,
      enum: ["all", "products", "categories"],
      default: "all",
    },
    productIds: [{ type: mongoose.Schema.Types.ObjectId }],
    categories: [{ type: String }],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);
PromotionSchema.methods.isValidFor = function ({ userId, orderTotal, cartItems }) {
  const now = new Date();
  if (!this.active) return { valid: false, reason: "Promo is not active" };
  if (this.startDate && now < this.startDate) return { valid: false, reason: "Promo not started yet" };
  if (this.endDate && now > this.endDate) return { valid: false, reason: "Promo expired" };
  if (this.minOrderValue && orderTotal < this.minOrderValue) return { valid: false, reason: "Minimum order value not met" };
  if (this.usageLimit && this.usageCount >= this.usageLimit) return { valid: false, reason: "Usage limit reached" };
  if (this.perUserLimit && userId) {
    const u = this.userUsage.find((x) => x.userId.toString() === userId.toString());
    if (u && u.count >= this.perUserLimit) return { valid: false, reason: "Per-user limit reached" };
  }  
  if (this.applicableTo === "products" && this.productIds && this.productIds.length) {
    const eligible = cartItems.some((it) => this.productIds.some((pid) => pid.toString() === String(it.productId || it.id)));
    if (!eligible) return { valid: false, reason: "No eligible products in cart" };
  }
  return { valid: true };
};
PromotionSchema.methods.calculateDiscount = function ({ orderTotal }) {
  let discount = 0;
  if (this.type === "percentage") {
    discount = (this.value / 100) * orderTotal;
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  } else if (this.type === "fixed") {
    discount = this.value;
  } else if (this.type === "free_shipping") {
    discount = 0; 
  } else if (this.type === "bogo") {
    discount = 0;
  }  
  discount = Math.min(discount, orderTotal);
  return Math.max(0, Number(discount.toFixed(2)));
};
module.exports = mongoose.model("Promotion", PromotionSchema);