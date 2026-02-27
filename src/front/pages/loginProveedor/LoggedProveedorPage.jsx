import { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function LoggedProveedorPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  useEffect(() => {
    if (!store.token) {
      navigate("/login/provider");
      return;
    }
    if (store.user && store.user.role !== "provider") {
      navigate("/login/provider");
    }
  }, [store.token, store.user]);

  if (!store.token || !store.user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mt-4">
      <h1>Bienvenido, {store.user.name}</h1>
      <p className="text-muted">Panel de Proveedor</p>

      <div className="mt-4">
        <button
          className="btn btn-primary me-3"
          onClick={() => navigate("/provider/books")}
        >
          Gestionar Libros
        </button>

        <button
          className="btn btn-success me-3"
          onClick={() => navigate("/provider/orders")}
        >
          Ver Pedidos
        </button>

        <button
          className="btn btn-primary me-3"
          onClick={() => navigate("/provider/books/search")}
        >
          Buscar e importar libros
        </button>

        <button
          className="btn btn-warning me-3"
          onClick={() => navigate("/provider/notifications")}
        >
          Solicitudes de Importación
        </button>



        <button
          className="btn btn-secondary"
          onClick={() => navigate("/provider/me")}
        >
          Volver al panel
        </button>
      </div>
    </div>
  );
}
