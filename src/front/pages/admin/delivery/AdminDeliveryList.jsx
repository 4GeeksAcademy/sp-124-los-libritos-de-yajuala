import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminDeliveryList() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/delivery/all`)
      .then(res => res.json())
      .then(data => {
        console.log("DELIVERIES:", data);
        setDeliveries(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Error cargando repartidores:", err);
        setDeliveries([]);
      });
  }, []);

  const deleteDelivery = async (id) => {
    if (!confirm("¿Eliminar repartidor?")) return;

    const resp = await fetch(`${backendUrl}/api/delivery/${id}`, {
      method: "DELETE"
    });

    if (resp.ok) {
      setDeliveries(deliveries.filter(d => d.id !== id));
    }
  };


  return (
    <div>
      <h1>Repartidores</h1>

      <Link to="/admin/delivery/create" className="btn btn-primary mb-3">
        Crear Repartidor
      </Link>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Identificación</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {deliveries.map(d => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.nombre} {d.apellido}</td>
              <td>{d.email}</td>
              <td>{d.identificacion}</td>
              <td>
                <Link to={`/admin/delivery/${d.id}`} className="btn btn-info btn-sm me-2">
                  Ver
                </Link>
                <Link to={`/admin/delivery/${d.id}/edit`} className="btn btn-warning btn-sm">
                  Editar
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteDelivery(d.id)}
                >
                  Eliminar
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
