import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminCartEdit() {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/carts/${id}`)
      .then(res => res.json())
      .then(data => setCart(data));

    fetch(`${backendUrl}/api/carts/${id}/items`)
      .then(res => res.json())
      .then(data => setItems(data));

    fetch(`${backendUrl}/api/books`)
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  const updateItem = (index, field, value) => {
    const updated = [...items];

    if (field === "id_libro") {
      const newBook = books.find(b => b.id === value);
      updated[index].precio = newBook?.precio || updated[index].precio;
    }

    updated[index][field] = value;
    setItems(updated);
  };


  const deleteItem = async (itemId) => {
    await fetch(`${backendUrl}/api/cart-books/${itemId}`, {
      method: "DELETE"
    });

    setItems(items.filter(i => i.id !== itemId));
  };

  const addItem = async (book) => {
    const resp = await fetch(`${backendUrl}/api/cart-books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_carrito: id,
        id_libro: book.id,
        cantidad: 1,
        precio: book.precio,
        descuento: 0
      })
    });

    const newItem = await resp.json();
    setItems([...items, newItem]);
  };

  const handleSave = async () => {
    for (const item of items) {
      await fetch(`${backendUrl}/api/cart-books/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cantidad: item.cantidad,
          descuento: item.descuento,
          precio: item.precio
        })
      });
    }

    navigate(`/admin/carts/${id}`);
  };



  const calcularTotal = () => {
    return items.reduce(
      (sum, item) =>
        sum + (item.precio * (1 - item.descuento)) * item.cantidad,
      0
    );
  };

  if (!cart) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Editar Carrito #{cart.id}</h1>

      <p><b>Cliente:</b> {cart.id_cliente}</p>
      <p><b>Estado:</b> {cart.estado}</p>
      <p><b>Total Actual:</b> {calcularTotal().toFixed(2)} €</p>

      <h3>Items del Carrito</h3>

      <table className="table">
        <thead>
          <tr>
            <th>Libro</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Descuento (%)</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((i, idx) => (
            <tr key={i.id}>
              <td>
                <select
                  className="form-select"
                  value={i.id_libro}
                  onChange={(e) => updateItem(idx, "id_libro", parseInt(e.target.value))}
                  style={{ width: "200px" }}
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.titulo}
                    </option>
                  ))}
                </select>
              </td>


              <td>
                <input
                  type="number"
                  min="1"
                  value={i.cantidad}
                  onChange={(e) =>
                    updateItem(idx, "cantidad", parseInt(e.target.value))
                  }
                  className="form-control"
                  style={{ width: "80px" }}
                />
              </td>

              <td>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={i.precio}
                  onChange={(e) =>
                    updateItem(idx, "precio", parseFloat(e.target.value))
                  }
                  className="form-control"
                  style={{ width: "100px" }}
                />
              </td>


              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={i.descuento * 100}
                  onChange={(e) =>
                    updateItem(idx, "descuento", parseFloat(e.target.value) / 100)
                  }
                  className="form-control"
                  style={{ width: "80px" }}
                />
              </td>

              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteItem(i.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Agregar Libro</h3>
      <ul>
        {books.map(b => (
          <li key={b.id}>
            {b.titulo} — {b.precio} €
            <button
              className="btn btn-sm btn-primary ms-2"
              onClick={() => addItem(b)}
            >
              Añadir
            </button>
          </li>
        ))}
      </ul>

      <button className="btn btn-success mt-4" onClick={handleSave}>
        Guardar Cambios
      </button>
    </div>
  );
}
