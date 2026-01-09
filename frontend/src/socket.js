import { io } from "socket.io-client";

const socketURL =
  import.meta.env.MODE === "production"
    ? "https://xerox-shop-backend.onrender.com"
    : "http://localhost:5000";

const socket = io(socketURL, {
  path: "/socket.io", // 🔥 MUST MATCH BACKEND
  withCredentials: true,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket error:", err.message);
});

export default socket;
