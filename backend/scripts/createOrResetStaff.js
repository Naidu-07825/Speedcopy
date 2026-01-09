require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function ensure(email, name, role, phone, password) {
  let user = await User.findOne({ email });
  const hashed = await bcrypt.hash(password, 10);

  if (user) {
    user.name = name;
    user.role = role;
    user.phone = phone;
    user.password = hashed;
    user.isVerified = true;
    await user.save();
    console.log(`Updated ${role} user: ${email} (password set)`);
  } else {
    user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role,
      isVerified: true,
    });
    console.log(`Created ${role} user: ${email}`);
  }
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const accounts = [
    { email: 'printer@xeroxshop.com', name: 'Printer Staff', role: 'printer', phone: '9000000001', password: 'printer123' },
    { email: 'delivery@xeroxshop.com', name: 'Delivery Staff', role: 'delivery', phone: '9000000002', password: 'delivery123' },
  ];

  for (const a of accounts) {
    try {
      await ensure(a.email, a.name, a.role, a.phone, a.password);
    } catch (err) {
      console.error('Error creating/updating', a.email, err.message || err);
    }
  }

  console.log('\nCredentials:');
  for (const a of accounts) {
    console.log(`${a.role.toUpperCase()}: ${a.email} / ${a.password}`);
  }

  process.exit();
}

run().catch(err => { console.error(err); process.exit(1); });