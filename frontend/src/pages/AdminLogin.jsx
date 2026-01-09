import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  
  useEffect(() => {
    if (localStorage.getItem("adminToken")) {
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await API.post("/admin/login", { email, password });

      
      localStorage.removeItem("token");
      localStorage.removeItem("user");

     
      localStorage.setItem("adminToken", res.data.token);

      window.dispatchEvent(new Event("adminUpdated"));

      navigate("/admin-dashboard");
    } catch (err) {
      console.error("ADMIN LOGIN ERROR:", err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow mx-auto" style={{ maxWidth: 400 }}>
        <h3 className="text-center mb-3">🔐 Admin Login</h3>

        <input
          className="form-control mb-2"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="input-group mb-3">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="input-group-text"
            style={{ cursor: "pointer" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button
          className="btn btn-dark w-100"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
