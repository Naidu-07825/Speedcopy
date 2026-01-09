import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function VerifyEmailOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  
  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  const verifyOtp = async () => {
    try {
      const res = await API.post("/auth/verify-email-otp", {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
      });

      alert("Email verified successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Server error");
    }
  };

  const resendOtp = async () => {
    try {
      await API.post("/auth/resend-email-otp", { email });

      alert("OTP resent to your email");
      setTimer(60);
    } catch (err) {
      alert(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow mx-auto" style={{ maxWidth: 400 }}>
        <h3 className="text-center mb-3">Verify Email</h3>

        <input
          className="form-control mb-2"
          placeholder="Registered Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="form-control mb-3"
          placeholder="Enter 4-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button className="btn btn-primary w-100 mb-2" onClick={verifyOtp}>
          Verify Email
        </button>

        <button
          className="btn btn-link w-100"
          disabled={timer > 0}
          onClick={resendOtp}
        >
          {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
