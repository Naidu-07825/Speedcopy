import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NotificationBell from "../Pages/NotificationBell";

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    const syncAuth = () => {
      const adminToken = localStorage.getItem("adminToken");
      const storedUser = localStorage.getItem("user");

      if (adminToken) {
        setIsAdmin(true);
        setUser(null);
        return;
      }

      setIsAdmin(false);

      if (storedUser && storedUser !== "undefined") {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Invalid user data");
          setUser(null);
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
      }
    };

    syncAuth();
    window.addEventListener("userUpdated", syncAuth);
    window.addEventListener("adminUpdated", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("userUpdated", syncAuth);
      window.removeEventListener("adminUpdated", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  
  const userLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login");
  };

  
  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("adminUpdated"));
    navigate("/");
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4 d-flex justify-content-between">
      
      <Link to="/" className="navbar-brand fw-bold">
        🖨️ SPEED COPY
      </Link>

      <div className="d-flex align-items-center gap-2">
        
        {isAdmin && (
          <>
            <Link to="/admin-dashboard" className="btn btn-warning">
              Dashboard
            </Link>

            <Link to="/admin-complaints" className="btn btn-info">
              Complaints
            </Link>

            <button onClick={adminLogout} className="btn btn-outline-light">
              Logout
            </button>
          </>
        )}

        
        {!isAdmin && user && (
          <>
            <NotificationBell />

            
            {user.role === "printer" && (
              <Link to="/printer-dashboard" className="btn btn-outline-light">
                Printer
              </Link>
            )}

            
            {user.role === "delivery" && (
              <Link to="/delivery-dashboard" className="btn btn-outline-light">
                Delivery
              </Link>
            )}

           
            <div className="dropdown">
              <button
                className="btn btn-outline-light dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                👤 {user.name || user.email}
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                { (user.role === "delivery" || user.role === "printer") ? (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        👤 My Profile
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/change-password">
                        🔐 Change Password
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={userLogout}
                      >
                        🚪 Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        👤 My Profile
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/my-orders">
                        📦 My Orders
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/cart">
                        🛒 Cart
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/services">
                        🛠️ Services
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/contact-support">
                        📞 Contact Support
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/notifications">
                        🔔 Notifications
                      </Link>
                    </li>

                    <li>
                      <Link className="dropdown-item" to="/change-password">
                        🔐 Change Password
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>

                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={userLogout}
                      >
                        🚪 Logout
                      </button>
                    </li>
                  </>
                ) }
              </ul>
            </div>
          </>
        )}

        
        {!isAdmin && !user && (
          <>
            <Link to="/Register" className="btn btn-outline-light">
              Register
            </Link>

            <Link to="/Login" className="btn btn-light">
              Login
            </Link>

            
            <div className="dropdown">
              <button
                className="btn btn-warning dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                Admin
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/admin-login")}
                  >
                    🧑‍💼 Admin Login
                  </button>
                </li>

                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/printer-login")}
                  >
                    🖨️ Printer Login
                  </button>
                </li>

                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/delivery-login")}
                  >
                    🚚 Delivery Login
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
