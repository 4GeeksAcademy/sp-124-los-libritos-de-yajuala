import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function AdminUserDetail() {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/user/${id}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  if (!user) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Usuario #{user.id}</h1>

      <p><b>Nombre:</b> {user.name} {user.lastname}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Rol:</b> {user.role}</p>

      <Link to={`/admin/users/${id}/edit`} className="btn btn-warning me-2">
        Editar
      </Link>
    </div>
  );
}
