require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'testuser@example.com';
  const password = 'password123';
  const name = 'Test User';
  const phone = '9999999999';

  let user = await User.findOne({ email });
  if (user) {
    console.log('User already exists. Ensuring verified.');
    user.isVerified = true;
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    console.log('Updated existing user to verified.');
    process.exit();
  }

  const hashed = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    phone,
    password: hashed,
    isVerified: true,
    loyaltyPoints: 0,
  });

  console.log('Created verified test user:', email, 'password:', password);
  process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });