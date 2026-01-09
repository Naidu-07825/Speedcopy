require('dotenv').config();
const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');

const MONGO = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO);
  console.log('Connected');

  const p = await Promotion.create({
    code: 'XMAS50',
    description: 'Christmas 50% off',
    type: 'percentage',
    value: 50,
    startDate: new Date('2025-12-20'),
    endDate: new Date('2026-01-05'),
    usageLimit: 1000,
    perUserLimit: 1,
    minOrderValue: 100,
  });

  console.log('Created promo', p);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });