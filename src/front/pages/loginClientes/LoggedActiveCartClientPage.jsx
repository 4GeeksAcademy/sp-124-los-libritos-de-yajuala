import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function LoggedActiveCartClientPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(true);
  const [activeCart, setActiveCart] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!store.user) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        // 1) carrito activo
        const res = await fetch(
          `${backendUrl}/api/clients/${store.user.id}/carts/active`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data?.msg || "Error cargando carrito activo");

        if (!data.active) {
          setActiveCart(null);
          setItems([]);
          setLoading(false);
          return;
        }

        setActiveCart(data.cart);

        // 2) items del carrito
        const resItems = await fetch(
          `${backendUrl}/api/carts/${data.cart.id}/items`
        );
        const dataItems = await resItems.json();

        if (!resItems.ok) throw new Error(dataItems?.msg || "Error cargando items");

        setItems(dataItems || []);
      } catch (e) {
        console.error(e);
        setActiveCart(null);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [store.user]);

  if (loading) return <div className="container mt-4">Cargando carrito...</div>;

  return (
    <div className="container mt-4">
      <h1>Mi carrito</h1>

      {!activeCart ? (
        <>
          <p className="mt-3">No tienes un carrito activo ahora mismo.</p>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary" onClick={() => navigate("/books")}>
              Ver libros
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/user")}>
              Volver a mi cuenta
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-3">
            <div><b>Carrito:</b> #{activeCart.id}</div>
            <div><b>Estado:</b> {activeCart.estado}</div>
            <div><b>Total:</b> {activeCart.monto_total}€</div>
          </div>

          <h4 className="mt-4">Items</h4>

          {items.length === 0 ? (
            <p>Este carrito no tiene items todavía.</p>
          ) : (
            <ul className="list-group mt-3">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div>
                      <b>{it.libro?.titulo || `Libro #${it.id_libro}`}</b>
                    </div>
                    <div className="text-muted">
                      Cantidad: {it.cantidad} · Precio: {it.precio}€ · Descuento: {it.descuento}€
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate(`/carts/${activeCart.id}`)}
                  >
                    Ver detalle
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="d-flex gap-2 mt-4">
            <button className="btn btn-secondary" onClick={() => navigate("/user")}>
              Volver a mi cuenta
            </button>
          </div>
        </>
      )}
    </div>
  );
}
