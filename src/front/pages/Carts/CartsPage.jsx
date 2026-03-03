import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function CartsPage() {
  const [carts, setCarts] = useState([]);
  const { store, dispatch } = useGlobalReducer();

  const fetchCarts = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts`);
    const data = await res.json();

    const cartsWithTotals = await Promise.all(
      data.map(async (cart) => {
        const itemsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/${cart.id}/items`);
        const items = await itemsRes.json();

        const total = items.reduce((acc, item) => {
          const precioConDescuento = item.precio * (1 - item.descuento);
          return acc + precioConDescuento * item.cantidad;
        }, 0);

        return { ...cart, monto_total_calculado: total };
      })
    );

    setCarts(cartsWithTotals);
  };



  useEffect(() => {
    fetchCarts();
  }, []);

  const deleteCart = async (id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/${id}`, {
      method: "DELETE"
    });
    fetchCarts();
  };

  const role = store.user?.role;
	const isAdmin = role === "admin";
	const isProvider = role === "provider";
	const isDelivery = role === "delivery";
	const isClient = role === "client";

  return (
    <div className="container mt-4">
      {(isClient || isAdmin) && (
        <>
        <div className="d-flex justify-content-between mb-4">
        <h1>Carritos</h1>
    
        <Link to="/carts/create" className="btn btn-success mb-3">
          Crear Carrito
        </Link>
      </div>
      <div className="row">
        {carts.map((c) => (
          <div key={c.id} className="col-md-4">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title">Carrito #{c.id}</h5>
                <p><strong>Cliente:</strong> {c.id_cliente}</p>
                <p><strong>Monto:</strong> {c.monto_total_calculado.toFixed(2)} €</p>
                <p><strong>Estado:</strong> {c.estado}</p>

                <Link to={`/carts/${c.id}`} className="btn btn-info me-2">
                  Ver
                </Link>

                <Link to={`/carts/${c.id}/edit`} className="btn btn-primary me-2">
                  Editar
                </Link>

                <button
                  className="btn btn-danger"
                  onClick={() => deleteCart(c.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div></>
)}
      <div className="text-center mt-4">
        <Link to="/" className="btn btn-secondary btn-lg">
          Volver a inicio
        </Link>
      </div>
      
      
    </div>
  );
}
