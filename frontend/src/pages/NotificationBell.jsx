import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);

  
  const fetchNotifications = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    API.get("/user/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Notification bell fetch error:", err));
  };

  useEffect(() => {
    
    fetchNotifications();

    
    window.addEventListener("notificationsUpdated", fetchNotifications);

    
    window.addEventListener("focus", fetchNotifications);

    return () => {
      window.removeEventListener(
        "notificationsUpdated",
        fetchNotifications
      );
      window.removeEventListener("focus", fetchNotifications);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Link
      to="/notifications"
      style={{ position: "relative", textDecoration: "none" }}
      title="Notifications"
    >
      🔔
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -10,
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
