import { useState } from "react";
import API from "../services/api";

export default function ContactSupport() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitComplaint = async () => {
    if (!message) return alert("Message required");

    try {
      setLoading(true);
      await API.post(
        "/support/contact",
        { message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Complaint sent to admin");
      setMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="container mt-5">
      <h1 style={{ color: "red" }}>CONTACT SUPPORT</h1>

      <textarea
        className="form-control mt-3"
        rows="5"
        placeholder="Describe your issue..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        className="btn btn-primary mt-3"
        onClick={submitComplaint}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </div>
  );
}
