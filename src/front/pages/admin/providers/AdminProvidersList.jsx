import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminProvidersList() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/provider`)
      .then(res => res.json())
      .then(data => setProviders(data));
  }, []);

  const deleteProvider = async (id) => {
    if (!confirm("¿Eliminar proveedor?")) return;

    const resp = await fetch(`${backendUrl}/api/provider/${id}`, {
      method: "DELETE"
    });

    if (resp.ok) {
      setProviders(providers.filter(p => p.id !== id));
    }
  };

  return (
    <div>
      <h1>Proveedores</h1>

      <Link to="/admin/providers/create" className="btn btn-primary mb-3">Crear Proveedor</Link>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {providers.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.email}</td>
              <td>
                <Link to={`/admin/providers/${p.id}`} className="btn btn-info btn-sm me-2">Ver</Link>
                <Link to={`/admin/providers/${p.id}/edit`} className="btn btn-warning btn-sm me-2">Editar</Link>
                <button className="btn btn-danger btn-sm" onClick={() => deleteProvider(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
