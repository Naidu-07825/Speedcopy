import { useEffect, useState } from "react";
import API, { BACKEND_ORIGIN } from "../services/api";

/* ================= FILE PREVIEW MODAL ================= */
function FilePreviewModal({ files, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [files]);

  if (!Array.isArray(files) || files.length === 0) return null;

  const currentFile = files[currentIndex];
  if (typeof currentFile !== "string") return null;

  const fullUrl = typeof currentFile === "string" && currentFile.startsWith("http")
    ? currentFile
    : `${BACKEND_ORIGIN}${currentFile}`;
  const isPdf = currentFile.toLowerCase().endsWith(".pdf");
  const isImage = /\.(png|jpg|jpeg)$/i.test(currentFile);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "85%",
          height: "90%",
          background: "#fff",
          borderRadius: 8,
          position: "relative",
          paddingTop: 50,
        }}
      >
        <button
          onClick={onClose}
          className="btn btn-danger"
          style={{ position: "absolute", top: 10, right: 10 }}
        >
          ✖
        </button>

        {files.length > 1 && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <button
              className="btn btn-sm btn-secondary me-2"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              ← Prev
            </button>
            <button
              className="btn btn-sm btn-secondary"
              disabled={currentIndex === files.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Next →
            </button>
            <span className="ms-2 text-muted">
              File {currentIndex + 1} of {files.length}
            </span>
          </div>
        )}

        <div style={{ width: "100%", height: "100%" }}>
          {isPdf && (
            <embed
              src={fullUrl}
              type="application/pdf"
              width="100%"
              height="100%"
            />
          )}

          {isImage && (
            <img
              src={fullUrl}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                display: "block",
                margin: "auto",
              }}
            />
          )}

          {!isPdf && !isImage && (
            <div className="text-center mt-5">
              <p>Preview not supported</p>
              <a href={fullUrl} target="_blank" rel="noreferrer">
                Open file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= OTP MODAL ================= */
function OtpModal({ otp, onClose }) {
  if (!otp) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 4000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="card p-4" style={{ width: 360 }}>
        <h5 className="mb-3 text-center">🔐 OTP Generated</h5>
        <div className="alert alert-info text-center">
          <b>OTP:</b> {otp}
        </div>
        <div className="text-end">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= PRINTER DASHBOARD ================= */
export default function PrinterDashboard() {
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [showReady, setShowReady] = useState(false);

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    const stored = localStorage.getItem("user");
    if (!stored) {
      window.location.href = "/";
      return;
    }

    try {
      const u = JSON.parse(stored);
      if (u.role !== "printer") {
        window.location.href = "/";
        return;
      }
    } catch {
      window.location.href = "/";
      return;
    }

    fetchOrders();
  }, [showReady]);

  const fetchOrders = async () => {
    try {
      const res = await API.get(`/staff/printer/orders?showReady=${showReady}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch orders");
    }
  };

  const startPrinting = async (id) => {
    await API.put(
      `/staff/printer/orders/${id}/start`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchOrders();
  };

  const completePrinting = async (id) => {
    const res = await API.put(
      `/staff/printer/orders/${id}/complete`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Ensure Ready orders are visible so printer can see the one they just marked Ready
    setShowReady(true);
    fetchOrders();

    alert(res.data?.message || 'Order marked Ready');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3>🖨️ Printer Dashboard</h3>
        <div>
          <button
            className={`btn btn-sm me-2 ${showReady ? "btn-success" : "btn-outline-secondary"}`}
            onClick={() => setShowReady((s) => !s)}
          >
            {showReady ? "Showing Ready" : "Show Ready"}
          </button>
        </div>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Price</th>
              <th>Status</th>
              <th>Copies</th>
              <th>Payment</th>
              <th>Files</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const allFiles = [];
              let totalCopies = 0;

              order.items?.forEach((item) => {
                // files
                if (Array.isArray(item.filePaths)) {
                  item.filePaths.forEach((fp) => {
                    if (typeof fp === "string" && (fp.startsWith("/uploads/") || fp.startsWith("http"))) {
                      allFiles.push(fp);
                    }
                  });
                }
                if (typeof item.filePath === "string" && (item.filePath.startsWith("/uploads/") || item.filePath.startsWith("http"))) {
                  allFiles.push(item.filePath);
                }

                // copies
                if (typeof item.copies === "number") {
                  totalCopies += item.copies;
                } else if (typeof item.copies === "string" && item.copies.trim() !== "") {
                  const n = parseInt(item.copies, 10);
                  if (!isNaN(n)) totalCopies += n;
                }
              });

              const isPaid = order.paymentStatus === "Paid";

              return (
                <tr key={order._id}>
                  <td>{order.orderId}</td>

                  <td>
                    <b>{order.items?.[0]?.service}</b>
                  </td>

                  <td>
                    {order.delivery?.name}
                    <br />
                    {order.delivery?.phone}
                  </td>

                  <td>₹{order.totalPrice}</td>

                  <td>{order.status}</td>
                  <td>{totalCopies > 0 ? totalCopies : "-"}</td>

                  {/* PAYMENT STATUS */}
                  <td>
                    <span
                      className={`badge ${
                        isPaid ? "bg-success" : "bg-warning"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  {/* FILES */}
                  <td>
                    {allFiles.length > 0 && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setPreviewFiles(allFiles)}
                      >
                        View ({allFiles.length})
                      </button>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td>
                    {!isPaid && (
                      <div className="alert alert-warning p-1 mb-0">
                        ⚠️ Payment not completed
                      </div>
                    )}

                    {isPaid && order.status === "Pending" && (
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={() => startPrinting(order._id)}
                      >
                        Start
                      </button>
                    )}

                    {isPaid && order.status === "Printing" && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => completePrinting(order._id)}
                      >
                        Mark Ready
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <FilePreviewModal
        files={previewFiles}
        onClose={() => setPreviewFiles([])}
      />


    </div>
  );
}
