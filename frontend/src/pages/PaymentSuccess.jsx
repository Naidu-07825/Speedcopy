import { useParams, Link } from "react-router-dom";

export default function PaymentSuccess() {
  const { orderId } = useParams();

  return (
    <div className="container mt-5 text-center">
      <h2 className="text-success">✅ Order Placed Successfully</h2>
      <p>Your order ID:</p>
      <h5 className="text-primary">{orderId}</h5>

      <p className="mt-3">This is a demo project. No real payment processed.</p>

      <Link to="/track-order" className="btn btn-outline-primary mt-3">
        Track Order
      </Link>
    </div>
  );
}
