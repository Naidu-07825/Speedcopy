import ServiceCard from "../components/ServiceCard";

export default function Services() {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">🛍️ Our Services</h2>

      <div className="row">
        <ServiceCard
          title="Xerox & Printing"
          desc="Black & white / Color printing"
          price="From ₹1 / page"
          path="/print"
          icon="🖨️"
        />

        <ServiceCard
          title="T-Shirt Printing"
          desc="Custom printed T-shirts"
          price="From ₹299"
          path="/tshirt-print"
          icon="👕"
        />

        <ServiceCard
          title="Mug Printing"
          desc="Photo & text printed mugs"
          price="From ₹249"
          path="/mug-print"
          icon="☕"
        />

        <ServiceCard
          title="Photo Frames"
          desc="Printed & framed photos"
          price="From ₹199"
          path="/photo-frame"
          icon="🖼️"
        />
      </div>
    </div>
  );
}
