import { NavLink } from "react-router-dom";

export default function ProviderSidebar() {
  const linkClass = ({ isActive }) =>
    `${isActive ? "isActive" : ""}`.trim();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.logo}>LL</div>
        <div>
          <div style={styles.brandTitle}>Los Libritos</div>
          <div style={styles.brandSub}>Panel proveedor</div>
        </div>
      </div>

      <div style={styles.sectionTitle}>GESTIÓN</div>

      <nav style={styles.nav}>
        
        <NavLink to="/provider/books" className={linkClass} style={styles.link}>
          Mis libros
        </NavLink>

        <NavLink to="/provider/books/search" className={linkClass} style={styles.link}>
          Importar libros
        </NavLink>

        <NavLink to="/provider/books/new" className={linkClass} style={styles.link}>
          Añadir libro
        </NavLink>

        <NavLink to="/provider/orders" className={linkClass} style={styles.link}>
          Pedidos
        </NavLink>
      </nav>

      <div style={styles.sectionTitle}>CUENTA</div>

      <nav style={styles.nav}>
        <NavLink to="/provider/me" className={linkClass} style={styles.link}>
          Perfil
        </NavLink>
      </nav>

      <div style={styles.footerHint}>
        Mantener el panel simple y consistente.
      </div>

      <style>{css}</style>
    </aside>
  );
}

const styles = {
  sidebar: {
    background: "linear-gradient(180deg, #0b1220 0%, #0a1020 100%)",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    padding: "18px",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  brand: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "10px 8px 16px 8px",
    marginBottom: "8px",
  },
  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.35)",
    color: "#e5e7eb",
    fontWeight: 800,
    letterSpacing: 0.5,
  },
  brandTitle: { color: "#e5e7eb", fontWeight: 700, lineHeight: 1.1 },
  brandSub: { color: "rgba(229,231,235,0.6)", fontSize: 12, marginTop: 2 },

  sectionTitle: {
    color: "rgba(229,231,235,0.45)",
    fontSize: 11,
    letterSpacing: 1,
    margin: "14px 8px 8px 8px",
  },
  nav: { display: "flex", flexDirection: "column", gap: 6 },
  link: {
    padding: "10px 10px",
    borderRadius: 10,
    textDecoration: "none",
    color: "rgba(229,231,235,0.78)",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
  },
  footerHint: {
    position: "absolute",
    bottom: 14,
    left: 18,
    right: 18,
    paddingTop: 12,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(229,231,235,0.45)",
    fontSize: 12,
  },
};

const css = `
a.isActive{
  background: rgba(99,102,241,0.18) !important;
  border: 1px solid rgba(99,102,241,0.35) !important;
  color: #e5e7eb !important;
}
a:hover{
  filter: brightness(1.05);
}
`;