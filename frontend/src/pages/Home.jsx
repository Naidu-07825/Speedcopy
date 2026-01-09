import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";
import bw from "../assets/services/bw-xerox.png";
import color from "../assets/services/color-print.png";
import binding from "../assets/services/binding.png";
import lamination from "../assets/services/lamination.png";
import scanning from "../assets/services/scanning.png";
import urgent from "../assets/services/urgent.png";

const STATIONERY_ITEMS = [
  { id: "st1", name: "Blue Ball Pen", mrp: 20, price: 10 },
  { id: "st2", name: "Black Ball Pen", mrp: 20, price: 10 },
  { id: "st3", name: "Gel Pen", mrp: 30, price: 15 },
  { id: "st4", name: "A4 Notebook (200 pages)", mrp: 120, price: 80 },
  { id: "st5", name: "A5 Notebook", mrp: 80, price: 55 },
  { id: "st6", name: "Practical Record Book", mrp: 100, price: 70 },
  { id: "st7", name: "Transparent File Folder", mrp: 40, price: 25 },
  { id: "st8", name: "Geometry Box", mrp: 150, price: 110 },
  { id: "st9", name: "Pencil + Eraser Combo", mrp: 30, price: 18 },
  { id: "st10", name: "Highlighter Pen", mrp: 50, price: 30 },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [qty, setQty] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const quantity = qty[item.id] || 1;

    cart.push({
      id: Date.now(),
      service: item.name,
      category: "stationery",
      mrp: item.mrp,
      price: item.price * quantity,
      unitprice: item.price,
      quantity,
      savings: (item.mrp - item.price) * quantity,
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Item added to cart");
  };

  return (
    <>
      
      <section className="hero">
        <div className="hero-content">
          <h1>
            {user ? `Welcome, ${user.name} 👋` : "Welcome to Speed Copy 👋"}
          </h1>
          <p>Upload documents, configure prints & get them delivered fast</p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/print")}>
              Place Order
            </button>
            <button className="btn-outline" onClick={() => navigate("/track")}>
              Track Order
            </button>

            {!user && (
              <>
              </>
            )}
          </div>
        </div>
      </section>

      
      <section className="services">
        <h2>Our Services</h2>
        <div className="service-grid">
          <ServiceCard title="Black & White Xerox" bg={bw} />
          <ServiceCard title="Color Printing" bg={color} />
          <ServiceCard title="Spiral & Binding" bg={binding} />
          <ServiceCard title="Lamination" bg={lamination} />
          <ServiceCard title="Scanning" bg={scanning} />
          <ServiceCard title="Urgent Orders" bg={urgent} />
        </div>
      </section>

      
      <section className="container my-5">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h4 className="mb-3">📍 Our Store Address</h4>

            <div className="row">
              <div className="col-md-6">
                <p className="fw-bold mb-1">Speed Copy</p>
                <p className="mb-1">Flat No: 1-26/A, Kommadi</p>
                <p className="mb-1">Visakhapatnam North</p>
                <p className="mb-1">Visakhapatnam, Andhra Pradesh</p>
                <p className="mb-1">📞 Phone: +91 7075251153</p>
                <p className="mb-1">⏰ Timings: 10:00 AM – 7:00 PM</p>

                <a
                  href="https://www.google.com/maps?q=Kommadi,Visakhapatnam"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary mt-2"
                >
                  📍 Get Directions
                </a>
              </div>

              <div className="col-md-6">
                <iframe
                  title="Store Location"
                  src="https://www.google.com/maps?q=Kommadi,Visakhapatnam&output=embed"
                  width="100%"
                  height="220"
                  style={{ border: 0, borderRadius: 8 }}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {user && (
        <section className="services">
          <h2>🛒 Stationery Store</h2>
          <div className="service-grid">
            {STATIONERY_ITEMS.map((item) => (
              <div className="service-card" key={item.id}>
                <h4>{item.name}</h4>
                <p><del>MRP ₹{item.mrp}</del></p>
                <p className="fw-bold text-success">Our Price ₹{item.price}</p>
                <p className="text-danger">You Save ₹{item.mrp - item.price}</p>

                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      setQty({
                        ...qty,
                        [item.id]: Math.max((qty[item.id] || 1) - 1, 1),
                      })
                    }
                  >−</button>

                  <span>{qty[item.id] || 1}</span>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      setQty({
                        ...qty,
                        [item.id]: (qty[item.id] || 1) + 1,
                      })
                    }
                  >+</button>
                </div>

                <button
                  className="btn btn-success mt-2"
                  onClick={() => addToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function ServiceCard({ title, bg }) {
  const navigate = useNavigate();

  return (
    <div
      className="service-card service-bg"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="service-overlay">
        <h3>{title}</h3>
        <button className="btn btn-success" onClick={() => navigate("/print")}>
          📤 Upload & Configure
        </button>
      </div>
    </div>
  );
}
