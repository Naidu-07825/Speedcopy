import { Navigate } from "react-router-dom";

export default function StaffRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  const stored = localStorage.getItem("user");
  if (!token || !stored) return <Navigate to="/login" />;

  try {
    const user = JSON.parse(stored);
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
    return children;
  } catch {
    localStorage.removeItem("user");
    return <Navigate to="/login" />;
  }
}
