import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function AdminDeliveryDetail() {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [delivery, setDelivery] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/delivery/${id}`)
      .then(res => res.json())
      .then(data => setDelivery(data));
  }, []);

  if (!delivery) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Repartidor #{delivery.id}</h1>

      <p><b>Nombre:</b> {delivery.nombre} {delivery.apellido}</p>
      <p><b>Email:</b> {delivery.email}</p>
      <p><b>Identificación:</b> {delivery.identificacion}</p>
      <p><b>Rol:</b> {delivery.role}</p>

      <div className="mt-4">
        <Link
          to={`/admin/delivery/${id}/edit`}
          className="btn btn-warning me-2"
        >
          Editar
        </Link>

        <Link
          to="/admin/delivery"
          className="btn btn-secondary"
        >
          Volver a la lista
        </Link>
      </div>
    </div>
  );
}
