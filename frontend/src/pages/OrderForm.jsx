import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

const fetchOrders = async () => {
  try {
    const res = await API.get("/orders/my-orders", { headers: { Authorization: `Bearer ${token}` } });
    setOrders(res.data || []);
  } catch (err) {
    console.error("Fetch orders failed", err);
  } finally {
    setLoading(false);
  }
};

    fetchOrders();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h4>Loading your orders...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📦 My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderId}</td>
                <td>
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td>₹{o.price}</td>
                <td>
                  <span className="badge bg-info">{o.status}</span>
                </td>
                <td>
                  <Link
                    to={`/success/${o.orderId}`}
                    className="btn btn-sm btn-primary"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
