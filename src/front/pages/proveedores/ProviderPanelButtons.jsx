import { useNavigate } from "react-router-dom";

export const ProviderPanelButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      <div className="d-flex gap-2 flex-wrap">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/provider/me")}
        >
          Volver al panel
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/provider/books")}
        >
          Gestionar Libros
        </button>

        <button
          type="button"
          className="btn btn-success"
          onClick={() => navigate("/provider/orders")}
        >
          Ver Pedidos
        </button>
      </div>

      <hr />
    </div>
  );
};
