import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function LoggedClientPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  if (!store.user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="container mt-4">
      <h1>Bienvenido, {store.user.name}</h1>
      <p className="text-muted">Panel de Usuario</p>

      <div className="mt-4 d-flex flex-wrap gap-3">
        <button
          className="btn btn-success"
          onClick={() => navigate("/user/history")}
        >
          Ver historial de pedidos
        </button>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/reviews/new")}
        >
          Crear review
        </button>

        <button
          className="btn btn-warning"
          onClick={() => navigate("/home-client")}
        >
          Ver libros
        </button>

    

      <button
        className="btn btn-success me-3"
        onClick={() => navigate("/user/cart")}
      >
        Ver carrito
      </button>



        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/home-client")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
