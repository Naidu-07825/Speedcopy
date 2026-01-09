
import { Link } from "react-router-dom";

export default function ServiceCard({ title, desc, price, path, icon }) {
  return (
    <div className="col-md-3 mb-4">
      <div className="card h-100 shadow text-center p-3">
        <div style={{ fontSize: "50px" }}>{icon}</div>
        <h5 className="mt-2">{title}</h5>
        <p className="text-muted">{desc}</p>
        <p className="fw-bold text-success">{price}</p>

        <Link to={path} className="btn btn-primary w-100">
          Order Now
        </Link>
      </div>
    </div>
  );
}
