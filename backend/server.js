  require("dotenv").config();
  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");
  const path = require("path");
  const http = require("http");
  const { Server } = require("socket.io");

  const paymentRoutes = require("./routes/payment");
  const staffRoutes = require("./routes/staff");
  const authRoutes = require("./routes/auth");
  const userRoutes = require("./routes/user");
  const orderRoutes = require("./routes/orders");
  const adminRoutes = require("./routes/admin");
  const promoRoutes = require("./routes/promo");
  const invoiceRoutes = require("./routes/invoice");
  const supportRoutes = require("./routes/support");

  const app = express();

  
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
  ];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

 
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.use((req, res, next) => {
    console.log("REQ ->", req.method, req.path, "Auth:", !!req.headers.authorization);
    next();
  });

  
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/staff", staffRoutes);
  app.use("/api/promo", promoRoutes);
  app.use("/api/invoice", invoiceRoutes);
  app.use("/api/support", supportRoutes);
  
  
  app.get("/", (req, res) => {
    res.send("Xerox Shop Backend Running ✅");
  });

  
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  
  global.io = io;

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB Connected");
      server.listen(process.env.PORT || 5000, () => {
        console.log("🚀 Server running on port 5000 + Socket running");
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB Error:", err.message);
    });