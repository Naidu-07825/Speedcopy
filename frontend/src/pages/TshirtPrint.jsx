import { useState } from "react";
import { calculateTshirtPrice } from "../utils/tshirtPriceCalculator";
import { useNavigate } from "react-router-dom";

export default function TshirtPrint() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "cotton",
    color: "white",
    size: "M",
    printSide: "front",
    quantity: 1,
  });

  const [file, setFile] = useState(null);

  const price = calculateTshirtPrice({
    type: form.type,
    printSide: form.printSide,
    quantity: form.quantity,
  });

  const addToCart = () => {
    if (!file) {
      alert("Please upload your design file");
      return;
    }

    const cartItem = {
      service: "T-Shirt Printing",
      ...form,
      quantity: Number(form.quantity),
      price,
      fileName: file.name,
    };

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));

    navigate("/cart");
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: 600 }}>
        <h3 className="text-center mb-3">👕 T-Shirt Printing</h3>

        
        <label className="form-label">Upload Design</label>
        <input
          type="file"
          className="form-control mb-3"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        
        <label className="form-label">T-Shirt Type</label>
        <select
          className="form-select mb-3"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="cotton">Cotton (₹199)</option>
          <option value="polyester">Polyester (₹149)</option>
        </select>

        
        <label className="form-label">Color</label>
        <select
          className="form-select mb-3"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
        >
          <option>White</option>
          <option>Black</option>
          <option>Red</option>
          <option>Blue</option>
        </select>

        
        <label className="form-label">Size</label>
        <select
          className="form-select mb-3"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        >
          <option>S</option>
          <option>M</option>
          <option>L</option>
          <option>XL</option>
          <option>XXL</option>
        </select>

        
        <label className="form-label">Print Side</label>
        <select
          className="form-select mb-3"
          value={form.printSide}
          onChange={(e) =>
            setForm({ ...form, printSide: e.target.value })
          }
        >
          <option value="front">Front (₹100)</option>
          <option value="back">Back (₹100)</option>
          <option value="both">Both (₹180)</option>
        </select>

       
        <label className="form-label">Quantity</label>
        <input
          type="number"
          className="form-control mb-3"
          min="1"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
        />

        
        <h4 className="text-center text-success mb-3">
          Total Price: ₹{price}
        </h4>

        <button className="btn btn-primary w-100" onClick={addToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
