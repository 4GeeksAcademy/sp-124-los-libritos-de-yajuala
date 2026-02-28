import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";

export default function LoggedActiveCartClientPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(true);
  const [activeCart, setActiveCart] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!store.user) { navigate("/login"); return; }

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/api/clients/${store.user.id}/carts/active`);
        const data = await res.json();
        if (!res.ok || !data.active) { setActiveCart(null); setItems([]); return; }

        setActiveCart(data.cart);
        const resItems = await fetch(`${backendUrl}/api/carts/${data.cart.id}/items`);
        const dataItems = await resItems.json();
        setItems(resItems.ok ? dataItems : []);
      } catch (e) {
        console.error(e);
        setActiveCart(null); setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [store.user]);

  const handleDeleteItem = async (itemId) => {
    try {
      const resp = await fetch(`${backendUrl}/api/cart-books/${itemId}`, { method: "DELETE" });
      const data = await resp.json();
      if (!resp.ok) { alert(data.msg || "Error eliminando item"); return; }
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch { alert("Error eliminando item"); }
  };

  const total = items.reduce((acc, item) => acc + item.precio * (1 - item.descuento) * item.cantidad, 0);

  if (loading) return <div className="cl-page"><div className="cl-loader">Cargando carrito</div></div>;

  /* ── Carrito vacío ── */
  if (!activeCart) return (
    <div className="cl-page cl-page-wide">
      <h1 className="cl-title">Mi carrito</h1>
      <div className="cl-empty" style={{ marginTop: "40px" }}>
        <div className="cl-empty-icon">🛒</div>
        <p className="cl-empty-title">Tu carrito está vacío</p>
        <p className="cl-empty-text">Explora el catálogo y añade libros que te interesen.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="cl-btn cl-btn-accent cl-btn-lg" onClick={() => navigate("/home-client")}>
            Ver libros
          </button>
          <button className="cl-btn cl-btn-ghost cl-btn-lg" onClick={() => navigate("/user")}>
            Mi cuenta
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Carrito con items ── */
  return (
    <div className="cl-page cl-page-wide">

      {/* Cabecera */}
      <div className="cl-page-header">
        <div className="cl-page-header-left">
          <div className="cl-breadcrumb">
            <span onClick={() => navigate("/user")} style={{ cursor: "pointer" }}>Mi cuenta</span>
            <span>›</span>
            <span>Mi carrito</span>
          </div>
          <h1 className="cl-title">Mi carrito</h1>
          <p className="cl-subtitle">Carrito #{activeCart.id} · {items.length} {items.length === 1 ? "título" : "títulos"}</p>
        </div>
        <button className="cl-btn cl-btn-ghost" onClick={() => navigate("/home-client")}>
          + Seguir comprando
        </button>
      </div>

      <div className="cl-cart-layout">

        {/* Lista de items */}
        <div className="cl-card">
          <div className="cl-card-header">
            <span className="cl-card-header-title">Libros seleccionados</span>
          </div>
          <div className="cl-card-body">
            {items.length === 0 ? (
              <div className="cl-empty">
                <div className="cl-empty-icon">📚</div>
                <p className="cl-empty-title">Sin libros</p>
                <p className="cl-empty-text">Este carrito todavía no tiene libros.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="cl-cart-item">
                  <div className="cl-cart-item-cover">
                    {item.libro?.portada
                      ? <img src={item.libro.portada} alt={item.libro.titulo} />
                      : "📖"
                    }
                  </div>
                  <div className="cl-cart-item-info">
                    <p className="cl-cart-item-title">{item.libro?.titulo || `Libro #${item.id_libro}`}</p>
                    {item.libro?.autor && (
                      <p className="cl-cart-item-author">{item.libro.autor}</p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span className="cl-cart-item-price">
                        {(item.precio * (1 - item.descuento)).toFixed(2)} €
                      </span>
                      {item.descuento > 0 && (
                        <span className="cl-cart-item-discount">-{(item.descuento * 100).toFixed(0)}%</span>
                      )}
                      <span style={{ fontSize: "12px", color: "var(--cl-text-muted)" }}>
                        × {item.cantidad}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--cl-text-muted)", margin: "4px 0 0" }}>
                      Subtotal: <strong>{(item.precio * (1 - item.descuento) * item.cantidad).toFixed(2)} €</strong>
                    </p>
                    <div className="cl-cart-item-actions">
                      <button
                        className="cl-btn cl-btn-danger cl-btn-sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Eliminar
                      </button>
                      <button
                        className="cl-btn cl-btn-ghost cl-btn-sm"
                        onClick={() => navigate(`/books/${item.id_libro}`)}
                      >
                        Ver libro
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="cl-order-summary">
          <div className="cl-order-summary-header">Resumen del pedido</div>
          <div className="cl-order-summary-body">
            <div className="cl-order-summary-row">
              <span>Artículos</span>
              <span>{items.length}</span>
            </div>
            <div className="cl-order-summary-row">
              <span>Estado</span>
              <span className={`cl-order-status cl-status-${activeCart.estado}`}>
                {activeCart.estado}
              </span>
            </div>
            <div className="cl-order-summary-total">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            {items.length > 0 && (
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
              onClick={() => navigate("/user")}
            >
              ← Mi cuenta
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
