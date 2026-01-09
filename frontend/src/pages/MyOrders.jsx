import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login again");
        return;
      }

      const res = await API.get("/orders/my-orders", { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data || []);
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      const res = await API.put(`/orders/cancel/${orderId}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

      alert(res.data?.message || "Order cancelled successfully");
      fetchMyOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Server error while cancelling order");
    }
  };

  if (loading) return <h4 className="text-center mt-5">Loading...</h4>;

  if (error)
    return (
      <div className="text-center mt-5 text-danger">
        <h4>{error}</h4>
        <Link to="/login" className="btn btn-dark mt-3">
          Login
        </Link>
      </div>
    );

  return (
    <div className="container mt-5">
      <h3 className="mb-4">📦 My Orders</h3>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="list-group">
          {orders.map((o) => (
            <div key={o._id} className="list-group-item mb-2">
              <p>
                <strong>Order ID:</strong> {o.orderId}
              </p>

              <p>
                <strong>Total:</strong> ₹{o.totalPrice}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`badge ${
                    o.status === "Pending"
                      ? "bg-warning"
                      : o.status === "Delivered"
                      ? "bg-success"
                      : o.status === "Cancelled"
                      ? "bg-danger"
                      : "bg-info"
                  }`}
                >
                  {o.status}
                </span>
              </p>

             
              {o.status === "Ready" && o.deliveryOtpPlain && (
                <p className="text-success fw-bold">
                  🔐 Delivery OTP: {o.deliveryOtpPlain}
                </p>
              )}

              <Link
                to={`/order/${o.orderId}`}
                className="btn btn-sm btn-primary me-2"
              >
                View Details
              </Link>

              {o.status === "Pending" && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => cancelOrder(o.orderId)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
