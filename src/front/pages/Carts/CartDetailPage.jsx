import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";

export default function CartDetailPage() {
  const { id } = useParams();
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const isClient = store.user?.role === "client";

  const total = items.reduce((acc, item) => acc + item.precio * (1 - item.descuento) * item.cantidad, 0);

  const fetchCart = () => fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/${id}`).then((r) => r.json()).then(setCart);
  const fetchItems = () => fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/${id}/items`).then((r) => r.json()).then(setItems);

  const deleteItem = async (itemId) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart-books/${itemId}`, { method: "DELETE" });
    fetchItems();
  };

  useEffect(() => { fetchCart(); fetchItems(); }, []);

  if (!cart) return <div className="cl-page"><div className="cl-loader">Cargando carrito</div></div>;

  return (
    <div className="cl-page cl-page-wide">

      {/* Cabecera */}
      <div className="cl-page-header">
        <div className="cl-page-header-left">
          <div className="cl-breadcrumb">
            <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Inicio</span>
            <span>›</span>
            <span onClick={() => navigate("/carts")} style={{ cursor: "pointer" }}>Carritos</span>
            <span>›</span>
            <span>Carrito #{cart.id}</span>
          </div>
          <h1 className="cl-title">Carrito #{cart.id}</h1>
        </div>
        {!isClient && (
          <Link to={`/carts/${id}/add-book`} className="cl-btn cl-btn-accent">
            + Agregar libro
          </Link>
        )}
      </div>

      <div className="cl-cart-layout">

        {/* Lista de items */}
        <div className="cl-card">
          <div className="cl-card-header">
            <span className="cl-card-header-title">Libros en el carrito</span>
            <span style={{ fontSize: "12px", color: "var(--cl-text-muted)" }}>{items.length} {items.length === 1 ? "título" : "títulos"}</span>
          </div>
          <div className="cl-card-body">
            {items.length === 0 ? (
              <div className="cl-empty">
                <div className="cl-empty-icon">🛒</div>
                <p className="cl-empty-title">Carrito vacío</p>
                <p className="cl-empty-text">No hay libros en este carrito.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="cl-cart-item">
                  <div className="cl-cart-item-cover">📖</div>
                  <div className="cl-cart-item-info">
                    <p className="cl-cart-item-title">{item.libro?.titulo || "Libro"}</p>
                    <p className="cl-cart-item-author">{item.libro?.autor}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="cl-cart-item-price">
                        {(item.precio * (1 - item.descuento)).toFixed(2)} €
                      </span>
                      {item.descuento > 0 && (
                        <span className="cl-cart-item-discount">-{(item.descuento * 100).toFixed(0)}%</span>
                      )}
                      <span style={{ fontSize: "12px", color: "var(--cl-text-muted)" }}>× {item.cantidad}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--cl-text-muted)", marginTop: "4px" }}>
                      Subtotal: <strong>{(item.precio * (1 - item.descuento) * item.cantidad).toFixed(2)} €</strong>
                    </p>
                    {!isClient && (
                      <div className="cl-cart-item-actions">
                        <Link to={`/cart-books/${item.id}/edit`} className="cl-btn cl-btn-primary cl-btn-sm">Editar</Link>
                        <button className="cl-btn cl-btn-danger cl-btn-sm" onClick={() => deleteItem(item.id)}>Eliminar</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div>
          <div className="cl-order-summary">
            <div className="cl-order-summary-header">Resumen del pedido</div>
            <div className="cl-order-summary-body">
              <div className="cl-order-summary-row">
                <span>Estado</span>
                <span className={`cl-order-status cl-status-${cart.estado}`}>{cart.estado}</span>
              </div>
              <div className="cl-order-summary-row">
                <span>Fecha</span>
                <span>{cart.fecha ? new Date(cart.fecha).toLocaleDateString("es-ES") : "—"}</span>
              </div>
              <div className="cl-order-summary-row">
                <span>Artículos</span>
                <span>{items.length}</span>
              </div>
              <div className="cl-order-summary-total">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              {isClient && cart.estado === "pendiente" && items.length > 0 && (
                <button
                  className="cl-btn cl-btn-accent cl-btn-lg cl-btn-block"
                  style={{ marginTop: "16px" }}
                  onClick={() => navigate("/checkout/address")}
                >
                  Tramitar pedido →
                </button>
              )}
              <button
                className="cl-btn cl-btn-ghost cl-btn-block"
                style={{ marginTop: "10px" }}
                onClick={() => navigate("/carts")}
              >
                ← Volver a carritos
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
