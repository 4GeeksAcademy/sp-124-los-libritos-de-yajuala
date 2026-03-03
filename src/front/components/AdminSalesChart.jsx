import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function AdminSalesChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(b => b.titulo),
        datasets: [
          {
            label: "Ventas",
            data: data.map(b => b.ventas),
            backgroundColor: "#4a90e2"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  return (
    <div style={{ height: "300px" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
