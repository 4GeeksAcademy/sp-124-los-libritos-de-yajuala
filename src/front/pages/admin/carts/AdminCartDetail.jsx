import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function AdminCartDetail() {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);

  const total = items.reduce(
    (sum, item) => sum + (item.precio * (1 - item.descuento)) * item.cantidad,
    0
  );

  useEffect(() => {
    fetch(`${backendUrl}/api/carts/${id}`)
      .then(res => res.json())
      .then(data => setCart(data));

    fetch(`${backendUrl}/api/carts/${id}/items`)
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  if (!cart) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Carrito #{cart.id}</h1>

      <p><b>Cliente:</b> {cart.id_cliente}</p>
      <p><b>Fecha:</b> {new Date(cart.fecha).toLocaleString()}</p>
      <p><b>Total:</b> {total.toFixed(2)} €</p>
      <p><b>Estado:</b> {cart.estado}</p>

      <h3>Items</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Libro</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Descuento</th>
          </tr>
        </thead>

        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.libro?.titulo}</td>
              <td>{i.cantidad}</td>
              <td>{i.precio} €</td>
              <td>{i.descuento * 100}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/admin/carts" className="btn btn-secondary mt-3">
        Volver a la lista de carritos
      </Link>
    </div>
  );
}
