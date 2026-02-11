import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function LoggedProveedorPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const role = store.user?.role;
  const isProvider = role === "provider";

  if (!store.user || !isProvider) {
    navigate("/login/provider");
    return null;
  }

  return (
    <div className="container mt-4">
      <h1>Bienvenido, {store.user.nombre}</h1>
      <p className="text-muted">Panel de Proveedor</p>

      <div className="mt-4">
        <button
          className="btn btn-primary me-3"
          onClick={() => navigate("/books")}
        >
          Gestionar Libros
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
