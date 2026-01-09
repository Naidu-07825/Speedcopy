import { useState } from "react";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const sendOtp = async () => {
    try {
      const res = await API.post("/auth/forgot-password", { email: email.toLowerCase() });
      alert(res.data?.message || "OTP sent");
      if (res.data) setOtpSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const resetPassword = async () => {
    try {
      const res = await API.post("/auth/reset-password", { email: email.toLowerCase(), otp, newPassword });
      alert(res.data?.message || "Password reset");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <div className="card p-4 shadow">
        <h4 className="text-center mb-3">🔐 Forgot Password</h4>

        {!otpSent ? (
          <>
            <input
              className="form-control mb-3"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-primary w-100" onClick={sendOtp}>
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              className="form-control mb-2"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              className="form-control mb-3"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="btn btn-success w-100" onClick={resetPassword}>
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
