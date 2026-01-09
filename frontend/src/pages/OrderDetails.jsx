import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  
  const downloadInvoice = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again");
        return;
      }

      const res = await API.get(`/invoice/${order.orderId}`, { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" });

      if (!res || !res.data) {
        alert("Failed to download invoice");
        return;
      }

      const blob = res.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error downloading invoice");
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (!order) return <p className="text-center mt-5">Order not found</p>;

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h3 className="mb-3">📦 Order Details</h3>

        <p><b>Order ID:</b> {order.orderId}</p>
        <p><b>Status:</b> {order.status}</p>
        <p><b>Total Paid:</b> ₹{order.totalPrice}</p>

        
        <p><b>Points Redeemed:</b> {order.pointsRedeemed || 0}</p>
        <p><b>Points Earned:</b> {order.pointsEarned || 0}</p>

        <hr />

        <h5>🧾 Items</h5>
        <ul className="list-group mb-3">
          {order.items.map((item, i) => (
            <li key={i} className="list-group-item">
              {item.service} — ₹{item.price}
            </li>
          ))}
        </ul>

        <h5>🚚 Delivery</h5>
        <p>{order.delivery.name}</p>
        <p>{order.delivery.phone}</p>
        <p>{order.delivery.address}</p>

        
        {order.status === "Delivered" && (
          <button
            className="btn btn-outline-success mt-3"
            onClick={downloadInvoice}
          >
            📄 Download Invoice
          </button>
        )}
      </div>
    </div>
  );
}
