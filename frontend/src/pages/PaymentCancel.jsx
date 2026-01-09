import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <div className="container mt-5 text-center">
      <h2 className="text-danger">❌ Payment Cancelled</h2>
      <p>Your order was not completed.</p>

      <Link to="/cart" className="btn btn-warning mt-3">
        Go Back to Cart
      </Link>
    </div>
  );
}
