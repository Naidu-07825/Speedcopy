const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = async function sendSMS(to, message) {
  if (!to) {
    console.warn("⚠️ SMS skipped: phone number missing");
    return;
  }

  try {
    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: to.startsWith("+") ? to : `+91${to}`,
    });

    console.log("📩 SMS SENT:", res.sid);
  } catch (err) {
    console.error("❌ TWILIO SMS ERROR:", err.message);
  }
};
