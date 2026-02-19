import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminCartsAbandoned() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [carts, setCarts] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/carts/abandoned`)
      .then(res => res.json())
      .then(data => setCarts(data));
  }, []);

  return (
    <div>
      <h1>Carritos Abandonados</h1>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {carts.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.id_cliente}</td>
              <td>{new Date(c.fecha).toLocaleString()}</td>
              <td>{c.monto_total} €</td>
              <td>
                <Link to={`/admin/carts/${c.id}`} className="btn btn-info btn-sm">
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
