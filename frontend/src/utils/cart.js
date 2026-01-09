export const getCart = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

export const addToCart = (service) => {
  const cart = getCart();

  const exists = cart.find((item) => item.id === service.id);

  if (exists) {
    exists.qty += 1;
  } else {
    cart.push({ ...service, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  
  window.dispatchEvent(new Event("cartUpdated"));
};

export const removeFromCart = (id) => {
  const cart = getCart().filter((item) => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("cartUpdated"));
};

export const clearCart = () => {
  localStorage.removeItem("cart");
  window.dispatchEvent(new Event("cartUpdated"));
};
