import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API, { BACKEND_ORIGIN } from "../services/api";
import RevenueCharts from "../components/RevenueCharts";
import socket from "../socket";


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


function OtpModal({ order, onClose, onVerify }) {
  const [otp, setOtp] = useState("");
  if (!order) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="card p-4" style={{ width: 360 }}>
        <h5 className="mb-3 text-center">🔐 Verify Delivery OTP</h5>

        {order.deliveryOtpPlain && (
          <div className="alert alert-info text-center">
            <b>OTP:</b> {order.deliveryOtpPlain}
          </div>
        )}

        <input
          className="form-control mb-3"
          placeholder="Enter 4-digit OTP"
          maxLength={4}
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
        />

        <div className="d-flex justify-content-between">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={() => onVerify(order._id, otp)}
          >
            Verify & Deliver
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateStaffModal({ show, onClose, form, setForm, onCreate, creating, created }) {
  if (!show) return null;

  const genPassword = () => {
    const p = Math.random().toString(36).slice(-8) + "A1";
    setForm({ ...form, password: p });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch {
      alert('Copy failed');
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card p-4" style={{ width: 420 }}>
        <h5 className="mb-3">➕ Create Staff Account</h5>

        <div className="mb-2">
          <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="form-control mb-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="form-control mb-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <div className="d-flex gap-2 mb-2">
            <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="delivery">Delivery</option>
              <option value="printer">Printer</option>
            </select>

            <div style={{ flex: 1 }}>
              <div className="input-group">
                <input className="form-control" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="btn btn-outline-secondary" onClick={genPassword}>Gen</button>
              </div>
            </div>
          </div>

          <div className="text-end">
            <button className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={creating} onClick={onCreate}>{creating ? 'Creating...' : 'Create'}</button>
          </div>

          {created && (
            <div className="alert alert-success mt-3">
              <div><b>Created:</b> {created.name} ({created.role})</div>
              <div>Email: <code>{created.email}</code></div>
              <div>Password: <code>{created.password}</code> <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => copyToClipboard(created.password)}>Copy</button></div>

              <div className="mt-2">
                <div>{created.emailSent ? "✅ Email sent to user" : "⚠️ Email not sent (check EMAIL settings)"}</div>
                <div>{created.smsSent ? "✅ SMS sent to user" : "⚠️ SMS not sent (check TWILIO settings)"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);
  const [previewFile, setPreviewFile] = useState([]);
  const [otpOrder, setOtpOrder] = useState(null);
  const [showPreBookings, setShowPreBookings] = useState(false);
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", phone: "", role: "delivery", password: "" });
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [createdStaff, setCreatedStaff] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    recentActiveUsers: 0,
  });

  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [deletingUser, setDeletingUser] = useState(null);

  const usersBtnRef = useRef(null);
  const usersDropdownRef = useRef(null);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch users');
    }
  };

  useEffect(() => {
    if (!showUsers) return;

    const onDocClick = (e) => {
      if (
        usersDropdownRef.current && usersDropdownRef.current.contains(e.target)
      ) return;
      if (usersBtnRef.current && usersBtnRef.current.contains(e.target)) return;
      setShowUsers(false);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') setShowUsers(false);
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showUsers]);

  
  useEffect(() => {
    if (!token) navigate("/admin-login");
  }, [token, navigate]);

  
  useEffect(() => {
    API.get("/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setOrders(res.data || []));
  }, [token]);

  
  useEffect(() => {
    API.get("/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setStats(res.data));
  }, [token]);

  
  useEffect(() => {
    socket.on("order-updated", (order) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? order : o))
      );
    });

    socket.on("order-ready", (order) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? order : o))
      );
    });

    socket.on("order-ready-admin", (order) => {
      // Update orders and show OTP to admin (order includes deliveryOtpPlain)
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      if (order.deliveryOtpPlain) {
        alert(`Order ${order.orderId} marked Ready. OTP: ${order.deliveryOtpPlain}`);
      }
    });

    socket.on("order-delivered", (order) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? order : o))
      );
    });

    socket.on("order-deleted", ({ _id }) => {
      setOrders((prev) => prev.filter((o) => o._id !== _id));
    });

    return () => {
      socket.off("order-updated");
      socket.off("order-ready");
      socket.off("order-ready-admin");
      socket.off("order-delivered");
      socket.off("order-deleted");
    };
  }, []);

 
  const updateStatus = async (id, status) => {
    await API.put(
      `/admin/orders/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  
  const markReady = async (id) => {
    try {
      const res = await API.put(
        `/admin/orders/${id}/ready`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.otp) {
        alert(`Order marked Ready. OTP: ${res.data.otp}`);
      }

      // Refresh orders
      const r = await API.get("/admin/orders", { headers: { Authorization: `Bearer ${token}` } });
      setOrders(r.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark Ready');
    }
  };

  
  const verifyOtp = async (id, otp) => {
    await API.put(
      `/admin/orders/${id}/verify-otp`,
      { otp },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setOtpOrder(null);
  };

  // Create staff user (printer/delivery)
  const createStaff = async () => {
    if (!staffForm.name || !staffForm.email || !staffForm.phone || !staffForm.password) {
      alert("All fields required");
      return;
    }

    try {
      setCreatingStaff(true);
      const res = await API.post(
        "/admin/create-staff",
        staffForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCreatedStaff({
        ...res.data.staff,
        email: res.data.staff.email,
        password: res.data.password,
        emailSent: res.data.emailSent,
        smsSent: res.data.smsSent,
      });
      setStaffForm({ name: "", email: "", phone: "", role: "delivery", password: "" });
      alert(`Staff created successfully. Email sent: ${res.data.emailSent ? 'Yes' : 'No'}. SMS sent: ${res.data.smsSent ? 'Yes' : 'No'}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create staff");
    } finally {
      setCreatingStaff(false);
    }
  };

const markOutForDelivery = async (orderId) => {
  try {
    await API.put(
      `/orders/admin/out-for-delivery/${orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Order marked as Out for Delivery");

    
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, status: "Out for Delivery" } : o
      )
    );
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update order");
  }
};
  
  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    await API.delete(`/admin/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>🧑‍💼 Admin Dashboard</h3>

        <div style={{ position: 'relative' }}>
          <button className="btn btn-primary me-2" onClick={() => { setShowCreateStaff(true); setCreatedStaff(null); }}>
            ➕ Create Staff
          </button>

          <div style={{ display: 'inline-block', position: 'relative' }}>
            <button ref={usersBtnRef} className="btn btn-outline-secondary me-2" onClick={async () => { if (!showUsers) { await fetchUsers(); setShowUsers(true); } else { setShowUsers(false); } }}>
              👥 Users
            </button>

            {showUsers && (
              <div ref={usersDropdownRef} className="card p-2 shadow" style={{ position: 'absolute', right: 0, top: '100%', width: 520, maxHeight: '60vh', overflowY: 'auto', zIndex: 3000 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>👥 Users</strong>
                  <button className="btn btn-sm btn-secondary" onClick={() => setShowUsers(false)}>Close</button>
                </div>

                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>{u.role || 'user'}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-danger"
                            disabled={deletingUser === u._id}
                            onClick={async () => {
                              if (!window.confirm(`Delete user ${u.email}?`)) return;
                              try {
                                setDeletingUser(u._id);
                                await API.delete(`/admin/users/${u._id}`, { headers: { Authorization: `Bearer ${token}` } });
                                setUsers((prev) => prev.filter((x) => x._id !== u._id));
                                alert('User deleted');
                              } catch (err) {
                                alert(err.response?.data?.message || 'Failed to delete user');
                              } finally {
                                setDeletingUser(null);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <button
            className="btn btn-outline-warning"
            onClick={() => setShowPreBookings((v) => !v)}
          >
            ⏰ {showPreBookings ? "All Orders" : "Pre-Bookings"}
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <RevenueCharts orders={orders} />
        </div>

        <div className="col-md-8">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Copies</th>
                <th>Files</th>
                <th>Actions</th>
                <th>Payment</th>
              </tr>
            </thead>

            <tbody>
              {orders
                .filter((o) => (showPreBookings ? o.isPreBooking : true))
                .map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderId}</td>
                    <td>{order.delivery?.name}</td>
                    <td>{order.status}</td>

                    <td>
                      {(() => {
                        let total = 0;
                        order.items?.forEach((item) => {
                          if (typeof item.copies === "number") total += item.copies;
                          else if (typeof item.copies === "string" && item.copies.trim() !== "") {
                            const n = parseInt(item.copies, 10);
                            if (!isNaN(n)) total += n;
                          }
                        });
                        return total > 0 ? total : "-";
                      })()}
                    </td>

                    <td>
                      {(() => {
                        const files = [];
                        order.items?.forEach((item) => {
                          if (Array.isArray(item.filePaths)) {
                            item.filePaths.forEach((fp) => {
                              if (typeof fp === "string" && (fp.startsWith("/uploads/") || fp.startsWith("http"))) {
                                files.push(fp);
                              }
                            });
                          }
                          if (typeof item.filePath === "string" && (item.filePath.startsWith("/uploads/") || item.filePath.startsWith("http"))) {
                            files.push(item.filePath);
                          }
                        });

                        if (files.length === 0) return null;

                        return (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setPreviewFile(files)}
                          >
                            View ({files.length})
                          </button>
                        );
                      })()}
                    </td>

                    <td>
                      {order.status === "Printing" && (
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => markReady(order._id)}
                        >
                          Ready
                        </button>
                      )}

                      {order.status === "Ready" && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setOtpOrder(order)}
                        >
                          Verify OTP
                        </button>
                      )}
                      {order.status === "Ready" && (
                        <button
                        className="btn btn-warning btn-sm me-1"
                        onClick={() => markOutForDelivery(order.orderId)}
                        >
                          🚚 Out for Delivery
                          </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger ms-1"
                        onClick={() => deleteOrder(order._id)}
                      >
                        Delete
                      </button>
                    </td>

                    <td>
  <span
    className={`badge ${
      order.paymentStatus === "Paid"
        ? "bg-success"
        : order.paymentStatus === "Pending"
        ? "bg-warning"
        : "bg-danger"
    }`}
  >
    {order.paymentStatus}
  </span>

  <div className="text-muted small">
    {order.paymentMethod?.toUpperCase()}
  </div>
</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      
      <CreateStaffModal
        show={showCreateStaff}
        onClose={() => setShowCreateStaff(false)}
        form={staffForm}
        setForm={setStaffForm}
        onCreate={createStaff}
        creating={creatingStaff}
        created={createdStaff}
      />



      <FilePreviewModal
        files={previewFile}
        onClose={() => setPreviewFile([])}
      />

      <OtpModal
        order={otpOrder}
        onClose={() => setOtpOrder(null)}
        onVerify={verifyOtp}
      />
    </div>
  );
}
