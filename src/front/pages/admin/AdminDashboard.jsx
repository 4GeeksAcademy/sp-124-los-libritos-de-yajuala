import { useEffect, useState } from "react";
import AdminSalesChart from "../../components/AdminSalesChart.jsx";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function AdminDashboard() {
  const [sales, setSales] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  useEffect(() => {
    fetch(`${backendUrl}/api/admin/book-sales`, {
      headers: {
        Authorization: `Bearer ${store.token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSales(data);
        else setSales([]);
      });
  }, []);



  return (
    <div>
      <h1>Dashboard Admin</h1>
      <p>Bienvenido al panel de administración.</p>
      <h2>Ventas por libro</h2>
      <AdminSalesChart data={sales} />

      <button className="bk-btn bk-btn-primary mt-4" onClick={() => navigate("/admin/recommendations")}
      >
        Gestionar recomendaciones
      </button>
    </div>
  );
}
