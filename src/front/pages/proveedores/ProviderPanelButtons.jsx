import { useNavigate } from "react-router-dom";

export const ProviderPanelButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      <div className="d-flex gap-2 flex-wrap">
        <button
          type="button"
          style={styles.btnNeutral}
          onClick={() => navigate("/provider/me")}
        >
          Volver al panel
        </button>

        <button
          type="button"
          style={styles.btnPrimary}
          onClick={() => navigate("/provider/books")}
        >
          Gestionar Libros
        </button>

        <button
          type="button"
          style={styles.btnSecondary}
          onClick={() => navigate("/provider/orders")}
        >
          Ver Pedidos
        </button>
      </div>

      <hr />
    </div>
  );
};

const styles = {
  btnPrimary: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "#1d4ed8",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnNeutral: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
  },
};