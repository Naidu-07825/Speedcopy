import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminPromotions() {
  const token = localStorage.getItem("adminToken");
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({ code: "", type: "percentage", value: 0, startDate: "", endDate: "", usageLimit: "", perUserLimit: "", minOrderValue: "", active: true, description: "" });

  useEffect(() => {
    if (!token) return;
    fetchPromos();
    
  }, []);

  async function fetchPromos() {
    try {
      const res = await API.get("/promo");
      setPromos(res.data || []);
    } catch (err) {
      console.error(err);
      const errorMsg = err.message === "Network Error" || err.code === "ERR_NETWORK"
        ? "Cannot connect to server. Please check if backend is running."
        : err.response?.data?.message || "Failed to fetch promos";
      alert(errorMsg);
    }
  }

  async function createPromo(e) {
    e.preventDefault();
    try {
      const payload = { ...form };
      const res = await API.post("/promo", payload, { headers: { Authorization: `Bearer ${token}` } });
      if (!res || !res.data) throw new Error("Create failed");
      setForm({ code: "", type: "percentage", value: 0, startDate: "", endDate: "", usageLimit: "", perUserLimit: "", minOrderValue: "", active: true, description: "" });
      fetchPromos();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create promo");
    }
  }

  async function deletePromo(id) {
    if (!confirm("Delete this promo?")) return;
    try {
      const res = await API.delete(`/promo/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res) throw new Error("Delete failed");
      fetchPromos();
    } catch (err) {
      console.error(err);
      alert(err.message || "Delete failed");
    }
  }

  return (
    <div className="admin-container">
      <h3 className="admin-title">🎯 Promotions & Discounts</h3>

      <form className="admin-form" onSubmit={createPromo}>
        <input required placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
          <option value="free_shipping">Free Shipping</option>
          <option value="bogo">Buy One Get One</option>
        </select>
        <input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        <input type="number" placeholder="Usage Limit" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) || undefined })} />
        <input type="number" placeholder="Per User Limit" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: Number(e.target.value) || undefined })} />
        <input type="number" placeholder="Min Order Value" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) || undefined })} />
        <label>
          Active <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
        </label>
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="admin-btn">Create Promo</button>
      </form>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Active</th>
              <th>Usage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p._id}>
                <td>{p.code}</td>
                <td>{p.type}</td>
                <td>{p.value}</td>
                <td>{p.active ? "Yes" : "No"}</td>
                <td>{p.usageCount}/{p.usageLimit || "∞"}</td>
                <td>
                  <button className="admin-btn delete" onClick={() => deletePromo(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
