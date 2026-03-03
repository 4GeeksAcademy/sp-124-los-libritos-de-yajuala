import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function ClientDetailPage() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [activeCart, setActiveCart] = useState(null);
  const [items, setItems] = useState([]);


  const fetchCliente = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`);
    const data = await res.json();
    setCliente(data);
  };


  const fetchActiveCart = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/clients/${id}/carts/active`);
    const data = await res.json();

    if (data.active) {
      setActiveCart(data.cart);
    }
  };

  const getCartColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "border-warning text-warning";
      case "pagado":
        return "border-success text-success";
      case "cancelado":
        return "border-danger text-danger";
      default:
        return "border-secondary";
    }
  };

  const fetchItems = async (cartId) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/${cartId}/items`);
    const data = await res.json();
    setItems(data);
  };

  const total = items.reduce((acc, item) => {
    const precioConDescuento = item.precio * (1 - item.descuento);
    return acc + precioConDescuento * item.cantidad;
  }, 0);



  useEffect(() => {
    fetchCliente();
    fetchActiveCart();
  }, []);

  useEffect(() => {
    if (activeCart) {
      fetchItems(activeCart.id);
    }
  }, [activeCart]);



  if (!cliente) return <p className="text-center mt-5">Cargando...</p>;

  return (
    <div className="container mt-4">
      <h1>Ficha del Cliente</h1>

      <div className="card mt-4 shadow">
        <div className="card-body">
          <h3>{cliente.name} {cliente.lastname}</h3>
          <p><strong>Email:</strong> {cliente.email}</p>
          <p><strong>ID:</strong> {cliente.id}</p>
          {activeCart && (
            <div className={`card p-3 mt-4 shadow-sm ${getCartColor(activeCart.estado)}`}>
              <h4 className="mb-3">
                Carrito {activeCart.estado}
              </h4>

              <p><strong>ID Carrito:</strong> {activeCart.id}</p>
              <p><strong>Total:</strong> {total.toFixed(2)} €</p>
               <p><strong>Estado:</strong> {activeCart.estado}</p>

              <Link to={`/carts/${activeCart.id}`} className="btn btn-outline-dark mt-2">
                Ver carrito
              </Link>
            </div>
          )}


          <Link to="/clients" className="btn btn-secondary mt-3">
            Volver a Clientes
          </Link>
        </div>
      </div>
    </div>
  );
}
