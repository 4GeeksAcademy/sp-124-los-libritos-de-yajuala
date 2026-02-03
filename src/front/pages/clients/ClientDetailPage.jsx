import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ClientDetailPage() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);

  const fetchCliente = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`);
    const data = await res.json();
    setCliente(data);
  };

  useEffect(() => {
    fetchCliente();
  }, []);

  if (!cliente) return <p className="text-center mt-5">Cargando...</p>;

  return (
    <div className="container mt-4">
      <h1>Ficha del Cliente</h1>

      <div className="card mt-4 shadow">
        <div className="card-body">
          <h3>{cliente.name} {cliente.lastname}</h3>
          <p><strong>Email:</strong> {cliente.email}</p>
          <p><strong>ID:</strong> {cliente.id}</p>

          <Link to="/clients" className="btn btn-secondary mt-3">
            Volver a Clientes
          </Link>
        </div>
      </div>
    </div>
  );
}
