import API from "../services/api";

export default function StripePayButton({ amount }) {
  const handlePay = async () => {
    const res = await API.post("/payment/create-checkout-session", { amount });
    window.location.href = res.data.url;
  };

  return (
    <button className="btn btn-primary" onClick={handlePay}>
      Pay Online ₹{amount}
    </button>
  );
}
