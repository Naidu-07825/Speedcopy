require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const admin = await Admin.findOne();
  if (!admin) {
    console.error('No admin found. Run createAdmin.js first.');
    process.exit(1);
  }

  await Notification.create({
    admin: admin._id,
    title: 'URGENT TEST',
    message: 'This is a test urgent notification for order #9999',
    isUrgent: true,
    meta: { orderId: '9999' },
  });

  console.log('Created test admin notification');
  process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });
