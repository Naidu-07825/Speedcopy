import { useEffect, useState } from "react";
import API from "../services/api";
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    
    API.get("/user/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Notification fetch error:", err));

    
    API.put("/user/notifications/read-all", null, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        
        window.dispatchEvent(new Event("notificationsUpdated"));
      })
      .catch((err) => console.error("Mark all read error:", err));
  }, []);

  return (
    <div className="container mt-4">
      <h3>🔔 Notifications</h3>

      {notifications.length === 0 && (
        <p className="text-muted mt-3">No notifications yet</p>
      )}

      <ul className="list-group mt-3">
        {notifications.map((n) => (
          <li
            key={n._id}
            className={`list-group-item ${
              n.read ? "" : "list-group-item-warning"
            }`}
          >
            <strong>{n.title}</strong>
            <p className="mb-1">{n.message}</p>
            <small className="text-muted">
              {new Date(n.createdAt).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
