import { useEffect, useState } from "react";
import API, { BACKEND_ORIGIN } from "../services/api";

function FilePreviewModal({ files, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!files || files.length === 0) return null;
  
  
  useEffect(() => {
    setCurrentIndex(0);
  }, [files]);
  
  const currentFile = files[currentIndex];
  const hasMultiple = files.length > 1;
  
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "80%", height: "90%", background: "#fff", borderRadius: 8, position: "relative" }}>
        <button onClick={onClose} className="btn btn-danger" style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>✖</button>
        
        {hasMultiple && (
          <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, display: "flex", gap: "10px", alignItems: "center" }}>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              ← Prev
            </button>
            <span style={{ color: "#fff", backgroundColor: "rgba(0,0,0,0.5)", padding: "5px 10px", borderRadius: "4px" }}>
              File {currentIndex + 1} of {files.length}
            </span>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={() => setCurrentIndex(Math.min(files.length - 1, currentIndex + 1))}
              disabled={currentIndex === files.length - 1}
            >
              Next →
            </button>
          </div>
        )}
        
        <iframe src={typeof currentFile === "string" && currentFile.startsWith("http") ? currentFile : `${BACKEND_ORIGIN}${currentFile}`} width="100%" height="100%" title="Preview" />
      </div>
    </div>
  );
}

function OtpModal({ order, onClose, onVerify }) {
  const [otp, setOtp] = useState("");
  if (!order) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card p-4" style={{ width: 360 }}>
        <h5 className="mb-3 text-center">🔐 Verify Delivery OTP</h5>

        <p className="text-muted">Ask the customer for the 4-digit OTP and enter it below.</p>

        <input className="form-control mb-3" placeholder="Enter 4-digit OTP" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0,4))} />

        <div className="d-flex justify-content-between">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={() => onVerify(order._id, otp)}>Verify & Deliver</button>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryDashboard() {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [otpOrder, setOtpOrder] = useState(null);

  useEffect(() => {
    if (!token) return;

    const stored = localStorage.getItem("user");
    if (!stored) return;
    try {
      const u = JSON.parse(stored);
      if (u.role !== "delivery") {
        window.location.href = "/"; 
        return;
      }
    } catch {
      window.location.href = "/";
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/staff/delivery/orders", { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch delivery orders failed", err);
      alert(err.response?.data?.message || "Failed to fetch orders");
    }
  };

  const verifyOtp = async (id, otp) => {
    try {
      await API.put(`/staff/delivery/orders/${id}/verify-otp`, { otp }, { headers: { Authorization: `Bearer ${token}` } });
      setOtpOrder(null);
      fetchOrders();
      alert("Order delivered successfully");
    } catch (err) {
      console.error("Verify OTP failed", err);
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="container mt-4">
      <h3>🚚 Delivery Dashboard</h3>

      <div className="table-responsive mt-3">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Price</th>
              <th>Actions</th>
              <th>Verify OTP</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.orderId}</td>
                <td><b>{order.items?.[0]?.service}</b></td>
                <td>
                  {order.delivery?.name}<br />{order.delivery?.phone}<br />
                  <small className="text-muted">{order.delivery?.address}</small>
                </td>
                <td>₹{order.totalPrice}</td>
                <td>
                  {(() => {
                    const allFiles = [];
                    order.items?.forEach((item) => {
                      if (Array.isArray(item.filePaths)) {
                        allFiles.push(...item.filePaths);
                      }
                      if (item.filePath) {
                        allFiles.push(item.filePath);
                      }
                    });

                    const validFiles = allFiles.filter((f) => typeof f === "string" && (f.startsWith("/uploads/") || f.startsWith("http")));
                    if (validFiles.length === 0) return null;

                    return (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setPreviewFile(validFiles)}
                      >
                        View ({validFiles.length})
                      </button>
                    );
                  })()}
                </td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => setOtpOrder(order)}>Verify OTP</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <FilePreviewModal files={previewFile} onClose={() => setPreviewFile(null)} />
      <OtpModal order={otpOrder} onClose={() => setOtpOrder(null)} onVerify={verifyOtp} />
    </div>
  );
}
