import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function ProviderTopbar({ title, onGoProfile }) {
  const { actions } = useGlobalReducer();
  const navigate = useNavigate();

  const handleLogout = () => {
    actions.setUser(null);
    actions.setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header style={styles.topbar}>
      <div>
        <div style={styles.kicker}>Proveedor</div>
        <h1 style={styles.title}>{title}</h1>
      </div>

      <div style={styles.actions}>
        <button style={styles.btnGhost} onClick={onGoProfile}>
          Perfil
        </button>
        <button style={styles.btnLogout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

const styles = {
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 22px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(15, 23, 42, 0.9)",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(8px)",
  },
  kicker: { color: "rgba(229,231,235,0.55)", fontSize: 12, marginBottom: 2 },
  title: { margin: 0, color: "#e5e7eb", fontSize: 18, fontWeight: 700 },
  actions: { display: "flex", gap: 10 },
  btnGhost: {
    borderRadius: 10,
    padding: "9px 12px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "#e5e7eb",
    cursor: "pointer",
  },
  btnLogout: {
    borderRadius: 10,
    padding: "9px 12px",
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
};