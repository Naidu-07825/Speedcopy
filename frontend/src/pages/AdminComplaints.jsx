import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [replies, setReplies] = useState({}); 

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/admin/complaints", { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } });
      setComplaints(res.data || []);
    } catch (err) {
      console.error("Fetch complaints failed", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  
  const resolveComplaint = async (id) => {
    const reply = replies[id];

    if (!reply) {
      alert("Please type a reply first");
      return;
    }

    try {
      const res = await API.put(`/admin/complaints/${id}/resolve`, { reply }, { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } });
      alert(res.data?.message || "Resolved");

      
      setReplies((prev) => ({ ...prev, [id]: "" }));
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Resolve failed");
    }
  };

  return (
    <div className="container mt-4">
      <h3>📩 User Complaints</h3>

      {complaints.length === 0 && <p>No complaints yet</p>}

      {complaints.map((c) => (
        <div key={c._id} className="card p-3 mt-3">
          <h6>{c.user?.name || "User"}</h6>

          <p>
            <b>User Issue:</b> {c.message}
          </p>

          <small>Status: {c.status}</small>

          
          {c.status === "Pending" && (
            <>
              <textarea
                className="form-control mt-2"
                placeholder="Type reply to user..."
                value={replies[c._id] || ""}
                onChange={(e) =>
                  setReplies({
                    ...replies,
                    [c._id]: e.target.value,
                  })
                }
              />

              <button
                className="btn btn-success btn-sm mt-2"
                onClick={() => resolveComplaint(c._id)}
              >
                Resolve & Send Reply
              </button>
            </>
          )}

          
          {c.status === "Resolved" && (
            <p className="mt-2 text-success">
              <b>Admin Reply:</b> {c.adminReply}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
