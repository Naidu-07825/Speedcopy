const orders = await Order.find({
  status: { $in: ["Pending", "Printing"] },
}).select(
  "status files paymentStatus paymentMethod createdAt"
);
