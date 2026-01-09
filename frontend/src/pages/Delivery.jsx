import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Delivery() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const submitDelivery = () => {
    
    if (!name.trim()) return alert("Enter your name");
    if (!phone.match(/^[6-9]\d{9}$/))
      return alert("Enter valid 10-digit phone number");
    if (!address.trim()) return alert("Enter full address");

    const deliveryData = {
      name,
      phone,
      address,
      email,
    };

    localStorage.setItem("delivery", JSON.stringify(deliveryData));
    navigate("/payment");
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow mx-auto" style={{ maxWidth: 600 }}>
        <h3 className="text-center mb-4">📍 Delivery Details</h3>

        
        <div className="mb-3">
          <label className="form-label fw-bold">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            className="form-control"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        
        <div className="mb-3">
          <label className="form-label fw-bold">
            Phone Number <span className="text-danger">*</span>
          </label>
          <input
            className="form-control"
            placeholder="10-digit mobile number"
            value={phone}
            maxLength={10}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        
        <div className="mb-3">
          <label className="form-label fw-bold">Email (Optional)</label>
          <input
            className="form-control"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        
        <div className="mb-3">
          <label className="form-label fw-bold">
            Full Address <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="House No, Street, Area, City, Pincode"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <button className="btn btn-success w-100" onClick={submitDelivery}>
          Continue to Payment →
        </button>
      </div>
    </div>
  );
}
