import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminCartCreate() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [libros, setLibros] = useState([]);
  const [idCliente, setIdCliente] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/user`)
      .then(res => res.json())
      .then(data => setClientes(data));

    fetch(`${backendUrl}/api/books`)
      .then(res => res.json())
      .then(data => setLibros(data));
  }, []);

  const addItem = (libro) => {
    setItems([...items, { libro, cantidad: 1, descuento: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!idCliente) {
      alert("Debes seleccionar un cliente");
      return;
    }

    const resp = await fetch(`${backendUrl}/api/carts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_cliente: idCliente })
    });

    const cart = await resp.json();

    for (const item of items) {
      await fetch(`${backendUrl}/api/cart-books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_carrito: cart.id,
          id_libro: item.libro.id,
          cantidad: item.cantidad,
          precio: item.libro.precio,
          descuento: item.descuento / 100
        })
      });
    }

    navigate(`/admin/carts/${cart.id}`);
  };

  return (
    <div>
      <h1>Crear Carrito Manual</h1>

      <label>Cliente</label>
      <select
        className="form-control mb-3"
        onChange={(e) => setIdCliente(e.target.value)}
      >
        <option value="">Seleccione...</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.email}
          </option>
        ))}
      </select>

      <h3>Agregar Libros</h3>
      <ul>
        {libros.map((l) => (
          <li key={l.id}>
            {l.titulo} — {l.precio} €
            <button
              className="btn btn-sm btn-primary ms-2"
              onClick={() => addItem(l)}
            >
              Añadir
            </button>
          </li>
        ))}
      </ul>

      <h3>Items Seleccionados</h3>
      <ul>
        {items.map((i, idx) => (
          <li key={idx} className="mb-2">
            <b>{i.libro.titulo}</b>

            <div className="d-flex gap-3 mt-1">
              <div>
                Cantidad:
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
              </div>

              <div>
                Descuento (%):
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={i.descuento}
                  onChange={(e) =>
                    updateItem(idx, "descuento", parseFloat(e.target.value))
                  }
                  className="form-control"
                  style={{ width: "80px" }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button className="btn btn-success mt-3" onClick={handleSubmit}>
        Crear Carrito
      </button>
    </div>
  );
}
