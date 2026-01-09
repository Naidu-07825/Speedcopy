require('dotenv').config();
const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  let promo = await Promotion.create({ code: 'TEST10', type: 'percentage', value: 10, startDate: new Date('2020-01-01'), endDate: new Date('2099-01-01'), usageLimit: 5, perUserLimit: 2 });
  console.log('Created', promo.code);

  const check = promo.isValidFor({ userId: mongoose.Types.ObjectId(), orderTotal: 500, cartItems: [] });
  console.log('Is valid?', check);

  const discount = promo.calculateDiscount({ orderTotal: 500 });
  console.log('Discount on ₹500:', discount);

  
  await Promotion.deleteOne({ _id: promo._id });
  console.log('Cleaned up');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });