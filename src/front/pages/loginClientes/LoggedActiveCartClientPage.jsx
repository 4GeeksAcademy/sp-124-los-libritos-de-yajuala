import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";
import { faBookOpen, faCartArrowDown, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    } catch {
      alert("Error eliminando item");
    }
  };

  const total = items.reduce(
    (acc, item) => acc + item.precio * (1 - item.descuento) * item.cantidad,
    0
  );

  if (loading) {
    return (
      <div className="container-fluid px-0 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="cl-loader">Cargando carrito</div>
      </div>
    );
  }

  if (!activeCart) {
    return (
      <div className="container-fluid px-0 py-4">
        <div className="text-center">
          <h1 className="h3 mb-4">Mi carrito</h1>
          <div className="fs-1 mb-3">🛒</div>
          <p className="mb-1">Tu carrito está vacío</p>
          <p className="text-muted">Explora el catálogo y añade libros que te interesen.</p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-success btn-lg" onClick={() => navigate("/home-client")}>
              Ver libros
            </button>
            <button className="btn btn-outline-secondary btn-lg" onClick={() => navigate("/user")}>
              Mi cuenta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0 py-4">
      <div className="d-flex justify-content-between align-items-start mb-4 px-3 px-md-4">
        <div>
          <nav className="breadcrumb mb-1">
            <span
              className="breadcrumb-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user")}
            >
              Mi cuenta
            </span>
            <span className="breadcrumb-item active">Mi carrito</span>
          </nav>

          <h1 className="h3 mb-1">Mi carrito</h1>
          <p className="text-muted mb-0">
            Carrito #{activeCart.id} · {items.length} {items.length === 1 ? "título" : "títulos"}
          </p>
        </div>

        <button className="btn btn-outline-secondary me-3 me-md-4" onClick={() => navigate("/home-client")}>
          + Seguir comprando
        </button>
      </div>

      <div className="row g-4 px-3 px-md-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0">
              <strong>Libros seleccionados</strong>
            </div>

            <div className="card-body">
              {items.length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1">
                    <FontAwesomeIcon icon={faFileLines} />
                  </div>
                  <h4 className="mt-3">Sin libros</h4>
                  <p className="text-muted">Este carrito todavía no tiene libros.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="d-flex gap-3 py-3 mb-2">
                    <div style={{ width: "90px", height: "120px" }}>
                      {item.libro?.portada ? (
                        <img
                          src={item.libro.portada}
                          alt={item.libro.titulo}
                          className="img-fluid rounded border-0"
                          style={{ height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="bg-light d-flex justify-content-center align-items-center rounded"
                          style={{ height: "100%" }}
                        >
                          <FontAwesomeIcon icon={faBookOpen} />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1">
                        {item.libro?.titulo || `Libro #${item.id_libro}`}
                      </h5>
                      {item.libro?.autor && (
                        <p className="text-muted mb-2">{item.libro.autor}</p>
                      )}

                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold">
                          {(item.precio * (1 - item.descuento)).toFixed(2)} €
                        </span>

                        {item.descuento > 0 && (
                          <span className="badge bg-danger">
                            -{(item.descuento * 100).toFixed(0)}%
                          </span>
                        )}

                        <span className="text-muted small">× {item.cantidad}</span>
                      </div>

                      <p className="text-muted small mb-2">
                        Subtotal:{" "}
                        <strong>
                          {(item.precio * (1 - item.descuento) * item.cantidad).toFixed(2)} €
                        </strong>
                      </p>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Eliminar
                        </button>

                        <button
                          className="btn btn-outline-secondary btn-sm"
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
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0">
              <strong>Resumen del pedido</strong>
            </div>

            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Artículos</span>
                <span>{items.length}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Estado</span>
                <span className="badge bg-info text-dark">{activeCart.estado}</span>
              </div>

              <div className="d-flex justify-content-between fs-5 fw-bold border-top pt-3">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>

              {items.length > 0 && (
                <button
                  className="btn btn-success w-100 mt-4"
                  onClick={() => navigate("/checkout/address")}
                >
                  Tramitar pedido →
                </button>
              )}

              <button
                className="btn btn-outline-secondary w-100 mt-3"
                onClick={() => navigate("/user")}
              >
                ← Mi cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
