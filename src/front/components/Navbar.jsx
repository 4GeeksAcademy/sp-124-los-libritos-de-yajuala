import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./Navbar.css";

/* ════════════════════════════════════════════════════════════
   ICONOS SVG inline (sin dependencia de librería)
   ════════════════════════════════════════════════════════════ */
const IcoHome = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>;
const IcoBooks = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm-6 14H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V6h8v2z" /></svg>;
const IcoCart = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8H20L17.7 15.6A2 2 0 0115.8 17H8.2A2 2 0 016.3 15.6L4 6H2V4H5L7.3 12.4A2 2 0 009.2 14H15a2 2 0 001.9-1.4zM9 20a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z" /></svg>;
const IcoHistory = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 015.66 15.9l1.41 1.41A11 11 0 0013 1v2zm-2 0v2A9 9 0 004.1 18.31L2.69 16.9A11 11 0 0111 3zm-9 9h2a9 9 0 009 9v2A11 11 0 012 12zm8.59.41L12 14l3.59-3.59L14.17 9 11 12.17 9.41 10.59 8 12l3.59 3.59-.41.41z" /></svg>;
const IcoReviews = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>;
const IcoUser = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>;
const IcoEdit = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>;
const IcoAddress = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5z" /></svg>;
const IcoLogout = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>;
const IcoChevron = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>;
const IcoMenu = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>;
const IcoBook = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" /></svg>;

/* ════════════════════════════════════════════════════════════
   CONFIGURACIÓN DE MENÚS POR ROL
   Añade aquí los arrays de otros roles cuando los implementes
   ════════════════════════════════════════════════════════════ */

// ── Cliente ──────────────────────────────────────────────────
const MENU_CLIENTE = {
  secciones: [
    {
      label: "Tienda",
      items: [
        { label: "Inicio", to: "/", icon: <IcoHome /> },
        { label: "Libros", to: "/books", icon: <IcoBooks /> },
        { label: "Reseñas", to: "/reviews", icon: <IcoReviews /> },
      ],
    },
    {
      label: "Mi cuenta",
      items: [
        { label: "Mi carrito", to: "/user/cart", icon: <IcoCart />, badge: null },
        { label: "Historial", to: "/user/history", icon: <IcoHistory /> },
        { label: "Mi perfil", to: "/user", icon: <IcoUser /> },
        { label: "Editar perfil", to: "/user/edit", icon: <IcoEdit /> },
        { label: "Mis direcciones", to: "/addresses", icon: <IcoAddress /> },
      ],
    },
  ],
};

// ── Aquí añadirás los menús de otros roles ───────────────────
// const MENU_ADMIN    = { secciones: [...] };
// const MENU_PROVIDER = { secciones: [...] };
// const MENU_DELIVERY = { secciones: [...] };

export const Navbar = ({ onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { store, actions } = useGlobalReducer();

  const [collapsed, setCollapsed] = useState(false);
  // Estado abierto/cerrado en móvil
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onToggle?.(next);
    window.dispatchEvent(new CustomEvent("bk-sidebar-toggle", { detail: { collapsed: next } }));
  };

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    actions.setUser(null);
    navigate("/");
  };

  // Datos del usuario
  const user = store.user;
  const role = user?.role;
  const isCliente = role === "client";
  const isAdmin = role === "admin";
  const isProvider = role === "provider";
  const isDelivery = role === "delivery";

  // Elige el menú según el rol
  // Cuando el usuario no está logueado mostramos solo la sección "Tienda"
  const menu = isCliente ? MENU_CLIENTE : {
    secciones: [
      {
        label: "Tienda",
        items: [
          { label: "Inicio", to: "/", icon: <IcoHome /> },
          { label: "Libros", to: "/books", icon: <IcoBooks /> },
          { label: "Reseñas", to: "/reviews", icon: <IcoReviews /> },
        ],
      },
    ],
  };

  // Etiqueta del rol para mostrar debajo del nombre
  const rolLabel = isCliente ? "Cliente" : "Invitado";
  const inicial = user?.name ? user.name[0].toUpperCase() : "?";
  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      {/* ── Botón hamburguesa (solo visible en móvil) ── */}
      <button
        className="bk-sb-mobile-btn"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Abrir menú"
      >
        <IcoMenu />
      </button>

      <div
        className={`bk-sb-overlay${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ════════ SIDEBAR ════════ */}
      <aside className={`bk-sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>

        {/* ── Cabecera: logo + botón colapsar ── */}
        <div className="bk-sb-header">
          <span className="bk-sb-logo" onClick={() => navigate("/")}>
            <div className="bk-sb-logo-icon">📚</div>
            <div className="bk-sb-logo-text">
              Los Libritos<span> de Yajuala</span>
            </div>
          </span>
          <button
            className="bk-sb-toggle"
            onClick={handleToggle}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {/* Flecha izquierda: se gira 180° cuando está colapsado (ver CSS) */}
            <IcoChevron />
          </button>
        </div>

        {/* ── Perfil de usuario (solo si está logueado) ── */}
        {user && (
          <div className="bk-sb-profile">
            <div className="bk-sb-avatar">{inicial}</div>
            <div className="bk-sb-profile-info">
              <div className="bk-sb-profile-name">{user.name}</div>
              <div className="bk-sb-profile-role">{rolLabel}</div>
            </div>
            {/* Tooltip en modo colapsado */}
            <div className="bk-sb-tooltip" style={{ top: "50%", left: "calc(var(--sb-width-collapsed) + 8px)" }}>
              {user.name}
            </div>
          </div>
        )}

        {/* ── Navegación ── */}
        <nav className="bk-sb-nav">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {menu.secciones.map((seccion, si) => (
              <React.Fragment key={si}>
                {/* Etiqueta de sección */}
                <li>
                  <div className="bk-sb-section-label">{seccion.label}</div>
                </li>

                {/* Items de la sección */}
                {seccion.items.map((item) => (
                  <li className="bk-sb-item" key={item.to}>
                    <Link
                      to={item.to}
                      className={`bk-sb-link${isActive(item.to) ? " active" : ""}`}
                    >
                      <span className="bk-sb-icon">{item.icon}</span>
                      <span className="bk-sb-text">{item.label}</span>
                      {/* Badge opcional (p.ej. nº items carrito)
                          Cuando tengas store.cartCount:
                          {item.badge !== undefined && store.cartCount > 0 && (
                            <span className="bk-sb-badge">{store.cartCount}</span>
                          )}
                      */}
                    </Link>
                    {/* Tooltip visible cuando el sidebar está colapsado */}
                    <span className="bk-sb-tooltip">{item.label}</span>
                  </li>
                ))}

                {/* Separador entre secciones (excepto la última) */}
                {si < menu.secciones.length - 1 && (
                  <li><div className="bk-sb-sep" /></li>
                )}
              </React.Fragment>
            ))}
          </ul>
        </nav>

        {/* ── Footer: login/registro o logout ── */}
        <div className="bk-sb-footer">
          {user ? (
            /* Usuario logueado → botón cerrar sesión */
            <div className="bk-sb-item">
              <button className="bk-sb-logout" onClick={handleLogout}>
                <span className="bk-sb-icon"><IcoLogout /></span>
                <span className="bk-sb-text">Cerrar sesión</span>
              </button>
              <span className="bk-sb-tooltip">Cerrar sesión</span>
            </div>
          ) : (
            /* Sin usuario → accesos rápidos a login y registro */
            <>
              <div className="bk-sb-item">
                <Link to="/login" className="bk-sb-link">
                  <span className="bk-sb-icon"><IcoUser /></span>
                  <span className="bk-sb-text">Entrar</span>
                </Link>
                <span className="bk-sb-tooltip">Entrar</span>
              </div>
              <div className="bk-sb-item">
                <Link to="/clients/create" className="bk-sb-link">
                  <span className="bk-sb-icon"><IcoBook /></span>
                  <span className="bk-sb-text">Registro</span>
                </Link>
                <span className="bk-sb-tooltip">Registro</span>
              </div>
            </>
          )}
        </div>

      </aside>
    </>
  );
};
