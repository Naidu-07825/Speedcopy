import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(Array.isArray(stored) ? stored : [stored]);
  }, []);

  
  const updateCart = (updated) => {
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const increaseQty = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id && item.service === "Xerox"
        ? {
            ...item,
            copies: item.copies + 1,
            price: item.unitprice * (item.copies + 1),
          }
        : item
    );
    updateCart(updated);
  };


  const decreaseQty = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id &&
      item.service === "Xerox" &&
      item.copies > 1
        ? {
            ...item,
            copies: item.copies - 1,
            price: item.unitprice * (item.copies - 1),
          }
        : item
    );
    updateCart(updated);
  };

 
  const removeItem = (id) => {
    if (!window.confirm("Remove this item from cart?")) return;
    const updated = cartItems.filter((item) => item.id !== id);
    updateCart(updated);
  };

  
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  async function applyPromo() {
    if (!promoCode) return alert("Enter a promo code");
    try {
      
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?.id || null;

      const res = await API.post("/promo/apply", { 
        code: promoCode, 
        cart: cartItems, 
        total: grandTotal,
        userId: userId 
      });
      
      const data = res.data;
      if (!data || !data.valid) {
        return alert(data?.reason || "Invalid promo");
      }
      
      setAppliedPromo(data.promo);
      setPromoDiscount(data.discount);
      alert(`✅ Promo applied! Discount: ₹${data.discount}`);
    } catch (err) {
      console.error("Promo apply error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to apply promo";
      alert(errorMsg);
    }
  }

  function removePromo() {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoDiscount(0);
  }

 
  const clearCart = () => {
    localStorage.removeItem("cart");
    setCartItems([]);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mt-5">
        <div className="card p-4 shadow text-center">
          <h4>Your cart is empty</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h3 className="mb-3">🛒 Your Cart</h3>

        {cartItems.map((item) => (
          <div key={item.id} className="border-bottom mb-3 pb-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p>
                  <b>Item:</b>{" "}
                  <span className="badge bg-info text-dark">
                    {item.service}
                  </span>
                </p>

                
                {item.pages && <p><b>Pages:</b> {item.pages}</p>}
                {item.copies && <p><b>Copies:</b> {item.copies}</p>}

                
                {item.category === "stationery" && (
                  <>
                    <p><b>Quantity:</b> {item.quantity}</p>
                    <p className="text-success">
                      You saved ₹{item.savings}
                    </p>
                  </>
                )}

                <p className="fw-bold">Price: ₹{item.price}</p>
              </div>

              <div>
                {item.service === "Xerox" && (
                  <>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => increaseQty(item.id)}
                    >
                      +
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => decreaseQty(item.id)}
                    >
                      −
                    </button>
                  </>
                )}

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <h4 className="text-end">
          Grand Total: ₹{grandTotal - promoDiscount}
        </h4>

        <div className="d-flex gap-2 mt-3">
          <input
            className="form-control"
            placeholder="Promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <button className="btn btn-outline-primary" onClick={applyPromo}>
            Apply
          </button>
          {appliedPromo && (
            <button className="btn btn-outline-secondary" onClick={removePromo}>
              Remove
            </button>
          )}
        </div>

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-danger w-50" onClick={clearCart}>
            Clear Cart
          </button>

          <button
            className="btn btn-primary w-50"
            onClick={() => {
              if (appliedPromo) {
                localStorage.setItem(
                  "appliedPromo",
                  JSON.stringify({
                    code: appliedPromo.code,
                    discount: promoDiscount,
                  })
                );
              } else {
                localStorage.removeItem("appliedPromo");
              }
              navigate("/delivery");
            }}
          >
            Proceed to Delivery
          </button>
        </div>
      </div>
    </div>
  );
}
