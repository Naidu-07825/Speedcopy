require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'delivery2@xeroxshop.com';
  const name = 'Delivery Agent 2';
  const phone = '9000000003';
  const password = 'delivery123';

  const hashed = await bcrypt.hash(password, 10);

  let user = await User.findOne({ email });
  if (user) {
    user.name = name;
    user.phone = phone;
    user.password = hashed;
    user.role = 'delivery';
    user.isVerified = true;
    await user.save();
    console.log('Updated existing delivery user:', email);
  } else {
    await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: 'delivery',
      isVerified: true,
    });
    console.log('Created delivery user:', email);
  }

  console.log('\nCredentials:');
  console.log(`DELIVERY: ${email} / ${password}`);

  process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });