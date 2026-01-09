import { useState } from "react";
import API from "../services/api";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderId.trim()) {
      setError("Please enter Order ID");
      return;
    }

    try {
      const res = await API.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Server not responding");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "600px" }}>
        <h3 className="text-center mb-4">📦 Track Your Order</h3>

        
        <form onSubmit={handleTrack}>
          <input
            className="form-control mb-3"
            placeholder="Enter Order ID (e.g. 1234)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />

          <button className="btn btn-primary w-100">
            Track Order
          </button>
        </form>

        
        {error && (
          <div className="alert alert-danger mt-3">{error}</div>
        )}

        
        {order && (
          <div className="mt-4">
            <hr />

            <p>
              <strong>Order ID:</strong> {order.orderId}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className="badge bg-info text-dark">
                {order.status}
              </span>
            </p>

            <p>
              <strong>Delivery Type:</strong>{" "}
              {order.deliveryType === "online"
                ? "Online Delivery"
                : "Store Pickup"}
            </p>

            <p>
              <strong>Price:</strong> ₹{order.price}
            </p>

            <p>
              <strong>Ordered On:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>

           
            <div className="alert alert-secondary mt-3">
              {order.status === "Pending" &&
                "🕒 Your order is pending and will be processed soon."}
              {order.status === "Processing" &&
                "⚙️ Your order is currently being processed."}
              {order.status === "Completed" &&
                "✅ Your order is completed."}
              {order.status === "Delivered" &&
                "🚚 Your order has been delivered."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
