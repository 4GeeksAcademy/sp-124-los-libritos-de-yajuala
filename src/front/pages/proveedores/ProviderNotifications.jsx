import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function ProviderNotifications() {
  const { store } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState([]);

  const loadNotificaciones = () => {
    fetch(`${backendUrl}/api/proveedores/notificaciones`, {
      headers: {
        Authorization: `Bearer ${store.token}`
      }
    })
      .then(res => res.json())
      .then(data => setNotificaciones(data))
      .catch(err => console.error("ERROR FETCHING NOTIFICATIONS:", err));
  };

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const actualizarEstado = async (id, accion) => {
    try {
      const res = await fetch(`${backendUrl}/api/proveedores/notificaciones/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`
        },
        body: JSON.stringify({ accion })
      });

      if (!res.ok) {
        alert("Error actualizando estado");
        return;
      }

      loadNotificaciones();
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Solicitudes de Importación</h2>
      <p className="text-muted">Libros recomendados por usuarios para importar</p>

      <button className="btn btn-secondary mb-3" onClick={() => navigate("/provider/me")}>
        Volver al panel
      </button>

      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Categoría</th>
              <th>Solicitado por</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {notificaciones.map(n => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.titulo}</td>
                <td>{n.autor}</td>
                <td>{n.categoria || "—"}</td>
                <td>{n.usuario || "—"}</td>
                <td>{new Date(n.created_at).toLocaleString()}</td>

                <td>
                  <span
                    className={`badge ${
                      n.estado === "pendiente"
                        ? "bg-warning"
                        : n.estado === "visto"
                        ? "bg-info"
                        : n.estado === "aceptado"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {n.estado}
                  </span>
                </td>

                <td>
                  {n.estado === "pendiente" && (
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => actualizarEstado(n.id, "visto")}
                    >
                      Marcar visto
                    </button>
                  )}

                  {n.estado !== "aceptado" && (
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => actualizarEstado(n.id, "aceptado")}
                    >
                      Aceptar
                    </button>
                  )}

                  {n.estado !== "rechazado" && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => actualizarEstado(n.id, "rechazado")}
                    >
                      Rechazar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
