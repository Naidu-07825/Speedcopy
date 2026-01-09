import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";
import axios from "axios";

export default function Login({ allowGoogle = true, allowRegister = true }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const intendedRole = params.get("role");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email: email.toLowerCase(),
        password,
      });

      const { token, user } = res.data;

      
      localStorage.removeItem("adminToken");

      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      
      window.dispatchEvent(new Event("userUpdated"));

      
      if (user.role === "printer") {
        navigate("/printer-dashboard");
      } else if (user.role === "delivery") {
        navigate("/delivery-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          credential: credentialResponse.credential,
        }
      );

      console.log(res.data)

      const {message ,token, user } = res.data;

      localStorage.removeItem("adminToken");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("userUpdated"));

      
      if (user.role === "printer") {
        navigate("/printer-dashboard");
      } else if (user.role === "delivery") {
        navigate("/delivery-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert("Google login failed");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "90vh" }}
    >
      <div className="card shadow p-4" style={{ width: 380 }}>
        <h3 className="text-center mb-3">Login</h3>

        {intendedRole && (
          <div className="alert alert-info text-center">
            Logging in as <b>{intendedRole.toUpperCase()}</b>.  
            Use your staff credentials.
          </div>
        )}

        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="input-group mb-2">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="input-group-text"
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div className="text-end mb-3">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {allowRegister && (
          <p className="text-center mt-3">
            New user? <Link to="/register">Register</Link>
          </p>
        )} 

        
        <hr />

        
        {allowGoogle && (!intendedRole || (intendedRole !== "printer" && intendedRole !== "delivery")) && (
          <div className="d-flex justify-content-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => alert("Google Sign In Failed")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
