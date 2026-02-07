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

      <div className="mt-4">
        <button
          className="btn btn-primary me-3"
          onClick={() => navigate("/user/cart")}
        >
          Ver historial de pedidos
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
