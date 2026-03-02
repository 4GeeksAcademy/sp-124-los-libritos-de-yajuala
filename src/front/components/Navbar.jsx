import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./Navbar.css";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
const IcoDashboard = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>;
const IcoUsers = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>;
const IcoProviders = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>;
const IcoCategories = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" /></svg>;
const IcoCarts = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.42 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>;
const IcoDelivery = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>;
const IcoOrders = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" /></svg>;
const IcoSearch = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>;
const IcoApprove = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>;
const IcoRoute = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" /></svg>;

const MENU_CLIENTE = {
  secciones: [
    {
      label: "Tienda",
      items: [
        { label: "Inicio", to: "/", icon: <IcoHome /> },
        { label: "Libros", to: "/home-client", icon: <IcoBooks /> },
        { label: "Reseñas", to: "/reviews", icon: <IcoReviews /> },
        { label: "Categorías", to: "/user/favorite-categories", icon: <IcoCategories /> },
      ],
    },
    {
      label: "Mi cuenta",
      items: [
        { label: "Mi carrito", to: "/user/cart", icon: <IcoCart /> },
        { label: "Historial", to: "/user/history", icon: <IcoHistory /> },
        { label: "Mi perfil", to: "/user", icon: <IcoUser /> },
        { label: "Mis direcciones", to: "/addresses", icon: <IcoAddress /> },
        { label: "Mis matches", to: "/swipe", icon: <IcoRoute /> },
      ],
    },
  ],
};

const MENU_ADMIN = {
  secciones: [
    {
      label: "Panel",
      items: [
        { label: "Dashboard", to: "/admin/dashboard", icon: <IcoDashboard /> },
      ],
    },
    {
      label: "Gestión",
      items: [
        { label: "Usuarios", to: "/admin/users", icon: <IcoUsers /> },
        { label: "Proveedores", to: "/admin/providers", icon: <IcoProviders /> },
        { label: "Libros", to: "/admin/books", icon: <IcoBooks /> },
        { label: "Libros recomendados", to: "/admin/recommendations", icon: <IcoRoute /> },
        { label: "Categorías", to: "/admin/categories", icon: <IcoCategories /> },
        { label: "Carritos", to: "/admin/carts", icon: <IcoCarts /> },
      ],
    },
    {
      label: "Operaciones",
      items: [
        { label: "Repartidores", to: "/admin/delivery", icon: <IcoDelivery /> },
        { label: "Pendientes aprob.", to: "/admin/repartidores", icon: <IcoApprove /> },
        { label: "Reseñas", to: "/admin/reviews", icon: <IcoReviews /> },
      ],
    },
  ],
};

const MENU_DELIVERY = {
  secciones: [
    {
      Label: "Reparto",
      items: [
        { label: "Pedidos asignados", to: "/delivery", icon: <IcoCart /> },
        { label: "Historial de reparto", to: "/delivery/history", icon: <IcoHistory /> },
      ],
    },
    {
      label: "Mi cuenta",
      items: [
        { label: "Mi perfil", to: "/loggeddelivery", icon: <IcoUser /> }
      ],
    }
  ]
}

const MENU_PROVIDER = {
  secciones: [
    {
      label: "Mi panel",
      items: [
        { label: "Mi perfil", to: "/provider/me", icon: <IcoUser /> },
        { label: "Mis pedidos", to: "/provider/orders", icon: <IcoOrders /> },
      ],
    },
    {
      label: "Mis libros",
      items: [
        { label: "Listado", to: "/provider/books", icon: <IcoBooks /> },
        { label: "Buscar libro", to: "/provider/books/search", icon: <IcoSearch /> },
        { label: "Añadir libro", to: "/provider/books/new", icon: <IcoEdit /> },
        { label: "Solicitudes de importación", to: "/provider/notifications", icon: <FontAwesomeIcon icon={faBell} /> },
      ],
    },
  ],
};

const ROL_LABELS = {
  client: "Cliente",
  admin: "Administrador",
  provider: "Proveedor",
  delivery: "Repartidor",
};

export const Navbar = ({ onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { store, actions } = useGlobalReducer();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    onToggle?.(next);
    window.dispatchEvent(new CustomEvent("bk-sidebar-toggle", { detail: { collapsed: next } }));
  };

  const handleLogout = () => {
    actions.logout();
    navigate("/");
  };


  const user = store.user;
  const role = user?.role;

  if (!user) return (
    <header className="bk-header-public">
      <span className="bk-header-logo" onClick={() => navigate("/")}>
        <span className="bk-header-logo-icon">📚</span>
        <span className="bk-header-logo-text">
          Los Libritos<span> de Yajuala</span>
        </span>
      </span>

      <nav className="bk-header-links">
        <Link to="/" className={`bk-header-link${location.pathname === "/" ? " active" : ""}`}>Inicio</Link>
      </nav>

      <div className="bk-header-actions">
  <Link to="/login" className="bk-header-btn bk-header-btn--client">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
    Iniciar sesión
  </Link>
</div>

    </header>
  );

  const menu = role === "admin" ? MENU_ADMIN
    : role === "provider" ? MENU_PROVIDER
      : role === "delivery" ? MENU_DELIVERY
        : MENU_CLIENTE;

  const rolLabel = ROL_LABELS[role] ?? "Usuario";
  const inicial = user.name ? user.name[0].toUpperCase() : "?";

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
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

      <aside className={`bk-sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>

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
            <IcoChevron />
          </button>
        </div>

        <div className="bk-sb-profile">
          <div className="bk-sb-avatar">{inicial}</div>
          <div className="bk-sb-profile-info">
            <div className="bk-sb-profile-name">{user.name}</div>
            <div className="bk-sb-profile-role">{rolLabel}</div>
          </div>
          <span className="bk-sb-tooltip">{user.name}</span>
        </div>

        <nav className="bk-sb-nav">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {menu.secciones.map((seccion, si) => (
              <React.Fragment key={si}>

                <li>
                  <div className="bk-sb-section-label">{seccion.label}</div>
                </li>

                {seccion.items.map((item) => (
                  <li className="bk-sb-item" key={item.to + item.label}>
                    <Link
                      to={item.to}
                      className={`bk-sb-link${isActive(item.to) ? " active" : ""}`}
                    >
                      <span className="bk-sb-icon">{item.icon}</span>
                      <span className="bk-sb-text">{item.label}</span>
                      {/* Badge del carrito — descomenta cuando tengas store.cartCount:
                          {item.badge !== undefined && store.cartCount > 0 && (
                            <span className="bk-sb-badge">{store.cartCount}</span>
                          )}
                      */}
                    </Link>
                    <span className="bk-sb-tooltip">{item.label}</span>
                  </li>
                ))}

                {si < menu.secciones.length - 1 && (
                  <li><div className="bk-sb-sep" /></li>
                )}

              </React.Fragment>
            ))}
          </ul>
        </nav>

        <div className="bk-sb-footer">
          <div className="bk-sb-item">
            <button className="bk-sb-logout" onClick={handleLogout}>
              <span className="bk-sb-icon"><IcoLogout /></span>
              <span className="bk-sb-text">Cerrar sesión</span>
            </button>
            <span className="bk-sb-tooltip">Cerrar sesión</span>
          </div>
        </div>

      </aside>
    </>
  );
};
