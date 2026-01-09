import { useEffect, useState } from "react";
import API from "../services/api";

export default function Promotions() {
  const [promos, setPromos] = useState([]);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await API.get("/promo");
      setPromos(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4 text-center">
        🎁 Offers & Discounts
      </h2>

      {promos.length === 0 ? (
        <p className="text-center text-muted">
          No active promotions right now
        </p>
      ) : (
        <div className="row g-4">
          {promos.map((promo) => (
            <div className="col-md-4" key={promo._id}>
              <div className="card promo-card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">

                  
                  <span className="badge bg-success align-self-start mb-2">
                    {promo.type === "PERCENT"
                      ? `${promo.value}% OFF`
                      : `₹${promo.value} OFF`}
                  </span>

                  <h5 className="card-title fw-bold">
                    {promo.title || "Special Offer"}
                  </h5>

                  <p className="text-muted small flex-grow-1">
                    {promo.description ||
                      "Use this coupon to get instant savings on your order."}
                  </p>

                  <div className="border rounded p-2 d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold text-primary">
                      {promo.code}
                    </span>

                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => copyCode(promo.code)}
                    >
                      {copied === promo.code ? "✔ Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="small text-muted mb-3">
                    ⏳ Valid till:{" "}
                    <strong>
                      {new Date(promo.endDate).toLocaleDateString()}
                    </strong>
                  </div>

                  <button className="btn btn-dark w-100">
                    Apply Coupon
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      <style>{`
        .promo-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .promo-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}
