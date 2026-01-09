const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

module.exports = function generateInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      
      const logoPath = path.join(__dirname, "../assets/logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 80 });
      }

      doc
        .fontSize(20)
        .text("XEROX SHOP", 150, 45)
        .fontSize(10)
        .text("GSTIN: 23ABCDE1234F1Z5", 150, 70)
        .text("Visakhapatnam, Andhra Pradesh", 150, 85);

      
      doc.moveDown(2);

      
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("FROM:", 50)
        .font("Helvetica")
        .text("SpeedCopy")
        .text("Flat No: 1-20/A, Kommadi")
        .text("Visakhapatnam North")
        .text("Visakhapatnam, Andhra Pradesh")
        .text("Phone: 7075251153")
        .text("Email: dasukoteswarnaidu0@gmail.com");

      
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Invoice No: INV-${order.orderId}`, 350, 140)
        .font("Helvetica")
        .text(`Order ID: ${order.orderId}`, 350)
        .text(`Invoice Date: ${new Date().toLocaleDateString("en-IN")}`);

      doc.moveDown(2);

      
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("BILL TO:")
        .font("Helvetica")
        .text(order.delivery.name)
        .text(order.delivery.address)
        .text(`Phone: ${order.delivery.phone}`)
        .text(`Email: ${order.delivery.email || "-"}`);

      doc.moveDown();

     
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Service", 50)
        .text("Price (₹)", 350)
        .font("Helvetica");

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      
      let subTotal = 0;

      order.items.forEach((item) => {
        subTotal += item.price || 0;

        doc
          .fontSize(10)
          .text(item.service, 50)
          .text(item.price.toFixed(2), 350)
          .moveDown(0.5);
      });

      doc.moveDown();

      
      const gstRate = 0.18;
      const gstAmount = subTotal * gstRate;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      const grandTotal = subTotal + gstAmount;

      doc.moveTo(300, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(10);
      doc.text(`Subtotal: ₹${subTotal.toFixed(2)}`, 300);
      doc.text(`CGST (9%): ₹${cgst.toFixed(2)}`, 300);
      doc.text(`SGST (9%): ₹${sgst.toFixed(2)}`, 300);
      doc.text(`Total GST: ₹${gstAmount.toFixed(2)}`, 300);
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 300)
        .font("Helvetica");

      
      if (order.pointsEarned && order.pointsEarned > 0) {
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .text(
            `⭐ Loyalty Points Earned: ${order.pointsEarned} points`,
            300
          );
      }

      doc.moveDown(2);

      
      doc
        .fontSize(9)
        .text("This is a computer generated GST invoice.", {
          align: "center",
        })
        .moveDown(0.3)
        .text("Thank you for choosing SpeedCopy", {
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
