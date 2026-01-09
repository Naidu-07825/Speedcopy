import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculatePhotoFramePrice } from "../utils/photoFramePriceCalculator";

export default function PhotoFrame() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    frameType: "plastic",
    size: "6x8",
    finish: "matte",
    quantity: 1,
  });

  const [file, setFile] = useState(null);

  const price = calculatePhotoFramePrice({
    frameType: form.frameType,
    size: form.size,
    finish: form.finish,
    quantity: Number(form.quantity),
  });

  const addToCart = () => {
    if (!file) {
      alert("Please upload photo");
      return;
    }

    const cartItem = {
      service: "Photo Frame Printing",
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
        <h3 className="text-center mb-3">🖼️ Photo Frame Printing</h3>

        
        <label className="form-label">Upload Photo</label>
        <input
          type="file"
          className="form-control mb-3"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

       
        <label className="form-label">Frame Type</label>
        <select
          className="form-select mb-3"
          value={form.frameType}
          onChange={(e) =>
            setForm({ ...form, frameType: e.target.value })
          }
        >
          <option value="plastic">Plastic Frame (₹199)</option>
          <option value="wooden">Wooden Frame (₹349)</option>
          <option value="canvas">Canvas Frame (₹499)</option>
        </select>

        
        <label className="form-label">Size</label>
        <select
          className="form-select mb-3"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        >
          <option value="6x8">6 × 8 inch</option>
          <option value="8x10">8 × 10 inch (+₹50)</option>
          <option value="12x18">12 × 18 inch (+₹150)</option>
        </select>

        
        <label className="form-label">Finish</label>
        <select
          className="form-select mb-3"
          value={form.finish}
          onChange={(e) =>
            setForm({ ...form, finish: e.target.value })
          }
        >
          <option value="matte">Matte</option>
          <option value="glossy">Glossy (+₹40)</option>
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
