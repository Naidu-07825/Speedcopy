import { io } from "socket.io-client";

const socketURL =
  import.meta.env.MODE === "production"
    ? "https://xerox-shop-backend.onrender.com"
    : "http://localhost:5000";

const socket = io(socketURL, {
  withCredentials: true,
});

// Debug socket connection
socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error);
});

export default socket;
