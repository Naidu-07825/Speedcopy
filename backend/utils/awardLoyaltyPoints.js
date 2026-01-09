const User = require("../models/User");

module.exports = async function awardLoyaltyPoints(order) {
  if (!order || !order.userId) return 0;

  
  if (order.pointsEarned && order.pointsEarned > 0) {
    console.log("⚠️ Loyalty already awarded for order", order.orderId);
    return order.pointsEarned;
  }
  const points = Math.floor(order.totalPrice / 100);

  if (points <= 0) return 0;

  const user = await User.findById(order.userId);
  if (!user) return 0;

 
  user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
  await user.save();

  order.pointsEarned = points;
  await order.save();

  console.log(
    `⭐ Loyalty awarded: ${points} points to user ${user._id} for order ${order.orderId}`
  );

  return points;
};
