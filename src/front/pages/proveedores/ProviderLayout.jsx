import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ProviderSidebar from "./ProviderSidebar.jsx";
import ProviderTopbar from "./ProviderTopbar.jsx";

export default function ProviderLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const getTitle = () => {
    const path = location.pathname;
    if (path.includes("/provider/books/search")) return "Importar libros";
    if (path.includes("/provider/books/new")) return "Añadir libro";
    if (path.includes("/provider/books")) return "Mis libros";
    if (path.includes("/provider/orders")) return "Pedidos";
    if (path.includes("/provider/me")) return "Perfil";
    return "Panel proveedor";
  };

  return (
    <div style={styles.shell}>
      <ProviderSidebar />

      <div style={styles.content}>
        <ProviderTopbar title={getTitle()} onGoProfile={() => navigate("/provider/me")} />

        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  shell: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    minHeight: "100vh",
    background: "#ffffff",
  },
  content: {
    background: "#ffffff",
    minHeight: "100vh",
  },
  main: {
    padding: "22px",
  },
};