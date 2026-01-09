import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateMugPrice } from "../utils/mugPriceCalculator";

export default function MugPrint() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    mugType: "normal",
    printSide: "single",
    quantity: 1,
  });

  const [file, setFile] = useState(null);

  const price = calculateMugPrice({
    mugType: form.mugType,
    printSide: form.printSide,
    quantity: Number(form.quantity),
  });

  const addToCart = () => {
    if (!file) {
      alert("Please upload your mug design/photo");
      return;
    }

    const cartItem = {
      service: "Mug Printing",
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
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: 550 }}>
        <h3 className="text-center mb-3">☕ Mug Printing</h3>

       
        <label className="form-label">Upload Photo / Design</label>
        <input
          type="file"
          className="form-control mb-3"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        
        <label className="form-label">Mug Type</label>
        <select
          className="form-select mb-3"
          value={form.mugType}
          onChange={(e) =>
            setForm({ ...form, mugType: e.target.value })
          }
        >
          <option value="normal">Normal White Mug (₹199)</option>
          <option value="magic">Magic Mug (₹299)</option>
          <option value="premium">Premium Ceramic Mug (₹249)</option>
        </select>

        
        <label className="form-label">Print Side</label>
        <select
          className="form-select mb-3"
          value={form.printSide}
          onChange={(e) =>
            setForm({ ...form, printSide: e.target.value })
          }
        >
          <option value="single">Single Side (Included)</option>
          <option value="both">Both Sides (+₹50)</option>
        </select>

        
        <label className="form-label">Quantity</label>
        <input
          type="number"
          min="1"
          className="form-control mb-3"
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
