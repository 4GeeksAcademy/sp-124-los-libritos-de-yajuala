import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [pendientesCount, setPendientesCount] = useState(0);

  const cargarContador = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/repartidores/pendientes/count`);
      const data = await resp.json();
      setPendientesCount(data.count);
    } catch (err) {
      console.error("Error cargando contador:", err);
    }
  };

  useEffect(() => {
    cargarContador();

    const handler = () => cargarContador();
    window.addEventListener("repartidorAprobado", handler);

    return () => window.removeEventListener("repartidorAprobado", handler);
  }, []);


  return (
    <div>
      <h1>Dashboard Admin</h1>
      <p>Bienvenido al panel de administración.</p>
      <div className="row mt-4">

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Repartidores pendientes</h5>
              <p className="card-text">
                Tienes <strong>{pendientesCount}</strong> repartidores esperando aprobación.
              </p>
              <Link to="/admin/repartidores" className="btn btn-primary">
                Ver repartidores
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
