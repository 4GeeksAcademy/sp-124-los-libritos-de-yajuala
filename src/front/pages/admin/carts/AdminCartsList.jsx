import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminCartsList() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [carts, setCarts] = useState([]);
  const [users, setUsers] = useState({});
  const [itemsByCart, setItemsByCart] = useState({});

  useEffect(() => {
    fetch(`${backendUrl}/api/carts`)
      .then(res => res.json())
      .then(async cartsData => {
        setCarts(cartsData);

        const userIds = [...new Set(cartsData.map(c => c.id_cliente))];

        const usersMap = {};
        for (const id of userIds) {
          const resp = await fetch(`${backendUrl}/api/user/${id}`);
          const data = await resp.json();
          usersMap[id] = data;
        }
        setUsers(usersMap);

        const itemsMap = {};
        for (const cart of cartsData) {
          const resp = await fetch(`${backendUrl}/api/carts/${cart.id}/items`);
          const data = await resp.json();
          itemsMap[cart.id] = data;
        }
        setItemsByCart(itemsMap);
      });
  }, []);

  const calcularTotal = (items) => {
    if (!items) return 0;
    return items.reduce(
      (sum, item) =>
        sum + (item.precio * (1 - item.descuento)) * item.cantidad,
      0
    );
  };

  const deleteCart = async (id) => {
    if (!confirm("¿Eliminar carrito?")) return;

    const resp = await fetch(`${backendUrl}/api/carts/${id}`, {
      method: "DELETE"
    });

    if (resp.ok) {
      setCarts(carts.filter(c => c.id !== id));
    }
  };


  return (
    <div>
      <h1>Carritos Activos</h1>

      <Link to="/admin/carts/create" className="btn btn-primary mb-3">
        Crear Carrito Manual
      </Link>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total Real</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {carts.map(c => {
            const cliente = users[c.id_cliente];
            const items = itemsByCart[c.id];
            const total = calcularTotal(items);

            return (
              <tr key={c.id}>
                <td>{c.id}</td>

                <td>
                  {cliente ? cliente.email : `ID ${c.id_cliente}`}
                </td>

                <td>{new Date(c.fecha).toLocaleString()}</td>

                <td>{total.toFixed(2)} €</td>

                <td>{c.estado}</td>

                <td>
                  <Link
                    to={`/admin/carts/${c.id}`}
                    className="btn btn-info btn-sm me-2"
                  >
                    Ver
                  </Link>

                  <Link
                    to={`/admin/carts/${c.id}/edit`}
                    className="btn btn-warning btn-sm me-2"
                  >
                    Editar
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteCart(c.id)} > Eliminar </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
