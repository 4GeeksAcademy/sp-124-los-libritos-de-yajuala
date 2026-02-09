import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function LoggedAdminPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  if (!store.user) {
    navigate("/login/admin");
    return null;
  }

  return (
    <div className="container mt-4">
      <h1>Bienvenido, Admin</h1>
      <p className="text-muted">Panel de Administrador</p>

      <div className="mt-4 d-flex flex-wrap gap-3">
        <button
          className="btn btn-success"
          onClick={() => navigate("/clients")}
        >
          Gestionar Usuarios
        </button>

        <button
          className="btn btn-warning"
          onClick={() => navigate("/provider")}
        >
          Gestionar Proveedores
        </button>

        <button
          className="btn btn-info"
          onClick={() => navigate("/delivery")}
        >
          Gestionar Repartidores
        </button>

        <button
          className="btn btn-danger"
          onClick={() => navigate("/carts")}
        >
          Ver Carritos
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/categorias")}
        >
          Categorías
        </button>

        <button
          className="btn btn-dark"
          onClick={() => navigate("/categorialibro")}
        >
          Categoría – Libro
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
