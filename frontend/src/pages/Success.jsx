import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API, { BACKEND_ORIGIN } from "../services/api";

export default function SuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = new URLSearchParams(window.location.search).get(
          "session_id"
        );

        if (!sessionId) {
          console.warn("No Stripe session_id found");
          return;
        }

        await API.get(`/payment/verify`, {
          params: { session_id: sessionId },
        });
      } catch (err) {
        console.error("❌ Payment verification failed:", err);
        alert("Payment verification failed");
      }
    };

    verifyPayment();
  }, []);


  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Order not found");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);


  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h4>Loading order details...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 text-center text-danger">
        <h4>{error}</h4>
        <Link to="/" className="btn btn-dark mt-3">
          Go Home
        </Link>
      </div>
    );
  }


  return (
    <div className="container mt-5">
      <div className="card p-4 shadow mx-auto" style={{ maxWidth: 600 }}>
        <h2 className="text-success text-center mb-3">
          ✅ Order Placed Successfully
        </h2>

        <p className="text-center">
          Thank you <strong>{order.delivery?.name || "Customer"}</strong>!
        </p>

        <hr />

        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p><strong>Total Amount:</strong> ₹{order.totalPrice}</p>

        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`badge ${
              order.status === "Delivered"
                ? "bg-success"
                : order.status === "Cancelled"
                ? "bg-danger"
                : "bg-warning text-dark"
            }`}
          >
            {order.status}
          </span>
        </p>

        <p>
          <strong>Payment Method:</strong>{" "}
          {order.paymentType === "cod"
            ? "Cash on Delivery"
            : order.paymentType === "stripe"
            ? "Stripe"
            : "Pay at Store"}
        </p>

        <hr />


        <h5>🧾 Order Items</h5>

        {order.items.map((item, index) => (
          <div key={index} className="border-bottom pb-2 mb-2">
            <p className="fw-bold">{item.service}</p>

            {item.pages && item.copies && (
              <p>
                {item.pages} pages × {item.copies} copies —{" "}
                <strong>₹{item.price}</strong>
              </p>
            )}

            {item.quantity && !item.pages && (
              <p>
                Quantity: {item.quantity} —{" "}
                <strong>₹{item.price}</strong>
              </p>
            )}
          </div>
        ))}

        
        <hr />
        <h5>📄 Uploaded File</h5>

        {order.items.some((i) => i.filePath) ? (
          order.items
            .filter((i) => i.filePath)
            .map((item, idx) => (
              <div key={idx} className="mb-3">
                <iframe
                  src={`${BACKEND_ORIGIN}${item.filePath}`}
                  width="100%"
                  height="400"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                  title="Uploaded File Preview"
                />

                <a
                  href={`${BACKEND_ORIGIN}${item.filePath}`}
                  download
                  className="btn btn-success mt-2 w-100"
                >
                  ⬇ Download File
                </a>
              </div>
            ))
        ) : (
          <p className="text-muted">No file uploaded</p>
        )}

        <div className="d-flex justify-content-between mt-4">
          <Link to="/" className="btn btn-outline-primary">
            Go Home
          </Link>

          <Link to="/my-orders" className="btn btn-success">
            My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
