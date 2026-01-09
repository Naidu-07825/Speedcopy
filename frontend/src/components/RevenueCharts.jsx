import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function RevenueCharts({ orders }) {
  
  const delivered = orders.filter(
    (o) => o.status === "Delivered"
  );

  
  const serviceRevenue = {};

  delivered.forEach((order) => {
    order.items.forEach((item) => {
      serviceRevenue[item.service] =
        (serviceRevenue[item.service] || 0) + item.price;
    });
  });

  const serviceChartData = {
    labels: Object.keys(serviceRevenue),
    datasets: [
      {
        label: "Revenue (₹)",
        data: Object.values(serviceRevenue),
      },
    ],
  };

  
  const today = new Date();
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const dailyRevenue = last7Days.map((date) => {
    return delivered
      .filter(
        (o) =>
          new Date(o.updatedAt)
            .toISOString()
            .slice(0, 10) === date
      )
      .reduce((sum, o) => sum + o.totalPrice, 0);
  });

  const dailyChartData = {
    labels: last7Days,
    datasets: [
      {
        label: "Daily Revenue (₹)",
        data: dailyRevenue,
        tension: 0.3,
      },
    ],
  };
  return (
  <>
    
    <div className="card shadow p-3 mb-4">
      <h6 className="text-center mb-3">
        Service-wise Revenue
      </h6>
      <Bar data={serviceChartData} />
    </div>

   
    <div className="card shadow p-3">
      <h6 className="text-center mb-3">
        Revenue (Last 7 Days)
      </h6>
      <Line data={dailyChartData} />
    </div>
  </>
  )};
