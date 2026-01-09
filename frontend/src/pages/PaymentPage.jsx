import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../services/api";

export default function PaymentPage() {
  const navigate = useNavigate();

  
  const [paymentType] = useState("stripe");
  const [files, setFiles] = useState([]);
  const [storedFilesInfo, setStoredFilesInfo] = useState([]);
  const [showReplaceUpload, setShowReplaceUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  
  const [usePoints, setUsePoints] = useState(false);

  
  const [isPreBooking, setIsPreBooking] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  
  useEffect(() => {
    try {
      const raw = localStorage.getItem("uploadedFiles");
      if (!raw) return;

      const info = JSON.parse(raw);
      setStoredFilesInfo(info);

      const restored = info
        .map((i) => {
          if (!i.dataUrl) return null;
          try {
            const arr = i.dataUrl.split(",");
            if (arr.length < 2) return null;
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
            if (!arr[1]) return null;
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            return new File([u8arr], i.name || "file", { type: mime });
          } catch (err) {
            console.warn("Failed to restore uploaded file", i, err);
            return null;
          }
        })
        .filter(Boolean);

      setFiles(restored);
    } catch (err) {
      console.warn("File restore error", err);
    }
  }, []);

  
  const handleFilesChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    setFiles(selected);

    const info = await Promise.all(
      selected.map(
        (file) =>
          new Promise((res) => {
            const reader = new FileReader();
            reader.onload = () =>
              res({ name: file.name, type: file.type, dataUrl: reader.result });
            reader.readAsDataURL(file);
          })
      )
    );

    setStoredFilesInfo(info);
    localStorage.setItem("uploadedFiles", JSON.stringify(info));
    setShowReplaceUpload(false);
  };

  const handleRemoveFile = (index) => {
    const f = files.filter((_, i) => i !== index);
    const i = storedFilesInfo.filter((_, x) => x !== index);

    setFiles(f);
    setStoredFilesInfo(i);

    if (!i.length) {
      localStorage.removeItem("uploadedFiles");
      setShowReplaceUpload(true);
    } else {
      localStorage.setItem("uploadedFiles", JSON.stringify(i));
    }
  };

  
  const placeOrder = async () => {
    const token = localStorage.getItem("token");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const delivery = JSON.parse(localStorage.getItem("delivery") || "null");

    const requiredCount = cart.filter((i) => i.pages && i.copies).length;
    if (requiredCount > files.length) {
      return alert(`Please upload ${requiredCount} PDF(s)`);
    }

    if (isPreBooking && (!scheduledDate || !scheduledTime)) {
      return alert("Select pre-book date and time");
    }

    try {
      setLoading(true);

      
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("cart", JSON.stringify(cart));
      formData.append("delivery", JSON.stringify(delivery || {}));
      formData.append("paymentType", paymentType);
      formData.append("usePoints", usePoints);
      formData.append("isPreBooking", isPreBooking);
      formData.append("scheduledDate", scheduledDate);
      formData.append("scheduledTime", scheduledTime);

      const promo = JSON.parse(localStorage.getItem("appliedPromo"));
      if (promo?.code) formData.append("promoCode", promo.code);

      const orderRes = await API.post("/orders", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const order = orderRes.data.order;
      if (!order || !order._id) {
        console.error("Invalid order response", orderRes.data);
        alert("Server error creating order");
        return;
      }

      
      const sessionRes = await API.post("/payment/create-checkout-session", {
        orderId: order._id, 
      });

      if (!sessionRes?.data?.url) {
        console.error("No checkout URL", sessionRes?.data);
        alert("Payment session creation failed");
        return;
      }

      localStorage.removeItem("cart");
      localStorage.removeItem("delivery");
      localStorage.removeItem("uploadedFiles");

      window.location.href = sessionRes.data.url;
    } catch (err) {
      console.error("PLACE ORDER ERROR:", err.response || err);
      alert(err?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <div className="container mt-5">
      <div className="card p-4 shadow mx-auto" style={{ maxWidth: 650 }}>
        <h3 className="text-center mb-3">💳 Payment</h3>

       
        <div className="card p-3 mb-3 border-warning">
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isPreBooking}
              onChange={(e) => setIsPreBooking(e.target.checked)}
            />
            <label className="form-check-label fw-bold text-warning">
              Pre-Book (10% OFF)
            </label>
          </div>

          {isPreBooking && (
            <div className="row">
              <div className="col-md-6 mb-2">
                <input
                  type="date"
                  className="form-control"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="time"
                  className="form-control"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

       
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={usePoints}
            onChange={(e) => setUsePoints(e.target.checked)}
          />
          <label className="form-check-label">
            Use Loyalty Points (max 20%)
          </label>
        </div>

        
        {storedFilesInfo.length > 0 && (
          <div className="card p-3 mb-3">
            {storedFilesInfo.map((f, i) => (
              <div key={i} className="d-flex justify-content-between">
                <span>{f.name}</span>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemoveFile(i)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-success w-100"
          onClick={placeOrder}
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay Online (Stripe)"}
        </button>
      </div>
    </div>
  );
}
