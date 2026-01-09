const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const auth = require("../middleware/userAuth");

router.get("/:orderId", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderId}.pdf`
    );

    doc.pipe(res);

    
    doc.fontSize(20).text("XEROX SHOP INVOICE", { align: "center" });
    doc.moveDown();

    
    doc.fontSize(12);
    doc.text(`Order ID: ${order.orderId}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    
    doc.text("Customer Details:");
    doc.text(`Name: ${order.delivery.name}`);
    doc.text(`Phone: ${order.delivery.phone}`);
    doc.text(`Address: ${order.delivery.address}`);
    doc.moveDown();

    
    doc.text("Order Items:");
    doc.moveDown(0.5);

    order.items.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.service} - ₹${item.price}`
      );
    });

    doc.moveDown();

    
    doc.text(`Subtotal: ₹${order.totalPrice + (order.pointsRedeemed || 0)}`);
    doc.text(`Loyalty Points Used: ₹${order.pointsRedeemed || 0}`);
    doc.text(`Total Paid: ₹${order.totalPrice}`);
    doc.moveDown();

    doc.text("Thank you for ordering with Speedcopy.", {
      align: "center",
    });

    doc.end();
  } catch (err) {
    console.error("INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
});

module.exports = router;
