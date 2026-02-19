import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function CartDetailPage() {
  const { id } = useParams();
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const handlePay = () => {
    navigate("/pasarelapago", {
      state: {
        cart,
        items,
        total
      }
    });
  };


  const total = items.reduce((acc, item) => {
    const precioConDescuento = item.precio * (1 - item.descuento);
    return acc + precioConDescuento * item.cantidad;
  }, 0);


  const fetchCart = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/${id}`);
    const data = await res.json();
    setCart(data);
  };

  const fetchItems = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/${id}/items`);
    const data = await res.json();
    setItems(data);
  };

  const deleteItem = async (itemId) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart-books/${itemId}`, {
      method: "DELETE"
    });

    fetchItems();
  };



  useEffect(() => {
    fetchCart();
    fetchItems();
  }, []);

  if (!cart) return <p className="text-center mt-5">Cargando...</p>;

  const role = store.user?.role;
  const isAdmin = role === "admin";
  const isProvider = role === "provider";
  const isDelivery = role === "delivery";
  const isClient = role === "client";

  return (
    <div className="container mt-4">
      <h1>Carrito #{cart.id}</h1>


      <div className="card p-4 shadow mt-3">
        <p><strong>ID Cliente:</strong> {cart.id_cliente}</p>
        <p className="mt-4"><strong>Monto total:</strong> {total.toFixed(2)} €</p>

        <p><strong>Estado:</strong> {cart.estado}</p>
        <p><strong>Fecha:</strong> {cart.fecha}</p>
        <h3 className="mt-4">Libros en este carrito</h3>

        {items.length === 0 && <p>No hay libros en este carrito.</p>}

        {items.map(item => (
          <div key={item.id} className="card p-3 mb-2 shadow-sm">
            <h5>{item.libro.titulo}</h5>
            <p><strong>Cantidad:</strong> {item.cantidad}</p>
            <p><strong>Precio del libro:</strong> {item.libro.precio} €</p>
            <p>
              <strong>Subtotal:</strong>{" "}
              {((item.precio * (1 - item.descuento)) * item.cantidad).toFixed(2)} €
            </p>

            <p><strong>Descuento:</strong> {item.descuento * 100}%</p>
            {!isClient && (
              <div className="d-flex">
                <Link
                  to={`/cart-books/${item.id}/edit`}
                  className="btn btn-primary btn-sm me-2"
                >
                  Editar
                </Link>


                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteItem(item.id)}
                >
                  Eliminar
                </button>
              </div>)}</div>
        ))}
        <div className="d-flex">
          {!isClient && (
            <Link to={`/carts/${id}/add-book`} className="btn btn-success me-2">
              Agregar libro
            </Link>
          )}
          {!isClient && cart.estado !== "pagado" && (
            <button
              onClick={handlePay}
              className="btn btn-warning me-2"
            >
              Pagar
            </button>
          )}


          <Link to="/carts" className="btn btn-secondary">
            Volver
          </Link>
        </div></div>
    </div>
  );
}
