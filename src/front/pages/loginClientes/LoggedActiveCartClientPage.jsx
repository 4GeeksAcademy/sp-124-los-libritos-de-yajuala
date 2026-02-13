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

  const handleDeleteItem = async (itemId) => {
    try {
      const resp = await fetch(
        `${backendUrl}/api/cart-books/${itemId}`,
        { method: "DELETE" }
      );

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.msg || "Error eliminando item");
        return;
      }

      setItems(items.filter((i) => i.id !== itemId));

    } catch (err) {
      console.error(err);
      alert("Error eliminando item");
    }
  };


  const handlePay = async () => {
    if (!activeCart) return;

    try {
      const resp = await fetch(
        `${backendUrl}/api/carts/${activeCart.id}/pay`,
        { method: "POST" }
      );

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.msg || "Error al pagar");
        return;
      }

      alert("Pago realizado con éxito");

      navigate("/payment-success");

    } catch (err) {
      console.error(err);
      alert("Error procesando el pago");
    }
  };


  if (loading) return <div className="container mt-4">Cargando carrito...</div>;

  return (
    <div className="container mt-4">
      <h1>Mi carrito</h1>

      {!activeCart ? (
        <>
          <p className="mt-3">No tienes un carrito activo ahora mismo.</p>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary" onClick={() => navigate("/home-client")}>
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
            <div><b>Total:</b> {items.reduce((acc, item) => {
              const precioConDescuento = item.precio * (1 - item.descuento);
              return acc + precioConDescuento * item.cantidad;
            }, 0).toFixed(2)} €</div>

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
                  <div className="d-flex">
                    <button
                      className="btn btn-danger me-1"
                      onClick={() => handleDeleteItem(it.id)}
                    >
                      Eliminar
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/carts/${activeCart.id}`)}
                    >
                      Ver detalle
                    </button></div>
                </li>
              ))}
            </ul>
          )}

          <div className="d-flex gap-2 mt-4">
            <button
              className="btn btn-success"
              onClick={() => navigate("/checkout/address")}

            >
              Pagar
            </button>

            <button className="btn btn-secondary" onClick={() => navigate("/user")}>
              Volver a mi cuenta
            </button>
          </div>
        </>
      )}
    </div>
  );
}
