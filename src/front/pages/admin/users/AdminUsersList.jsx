import { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";

export default function AdminUsersList() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/user`)
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;

    const resp = await fetch(`${backendUrl}/api/user/${id}`, {
      method: "DELETE"
    });

    if (resp.ok) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div>
      <h1>Clientes</h1>

      <Link to="/admin/users/create" className="btn btn-primary mb-3">
        Crear Cliente
      </Link>

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
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name} {u.lastname}</td>
              <td>{u.email}</td>
              <td>
                <Link to={`/admin/users/${u.id}`} className="btn btn-info btn-sm me-2">Ver</Link>
                <Link to={`/admin/users/${u.id}/edit`} className="btn btn-warning btn-sm me-2">Editar</Link>
                <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
