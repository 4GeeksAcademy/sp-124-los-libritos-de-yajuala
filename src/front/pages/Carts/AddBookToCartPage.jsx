import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AddBookToCartPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    id_libro: "",
    cantidad: 1,
    precio: 0,
    descuento: 0
  });

  const fetchBooks = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/books`);
    const data = await res.json();
    setBooks(data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveItem = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart-books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_carrito: id,
        id_libro: form.id_libro,
        cantidad: form.cantidad,
        precio: form.precio,
        descuento: form.descuento
      })
    });

    navigate(`/carts/${id}`);
  };

  return (
    <div className="container mt-4">
      <h1>Agregar libro al carrito #{id}</h1>

      <div className="card p-4 shadow mt-3">

        <div className="mb-3">
          <label className="form-label">Libro</label>
          <select
            name="id_libro"
            className="form-control"
            value={form.id_libro}
            onChange={handleChange}
          >
            <option value="">Seleccione un libro</option>
            {books.map(b => (
              <option key={b.id} value={b.id}>
                {b.titulo} — {b.autor}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            className="form-control"
            value={form.cantidad}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Precio</label>
          <input
            type="number"
            name="precio"
            className="form-control"
            value={form.precio}
            onChange={handleChange}
            step="0.01"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descuento (%)</label>
          <input
            type="number"
            name="descuento"
            className="form-control"
            value={form.descuento}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div className="d-flex">
          <button className="btn btn-success" onClick={saveItem}>
            Agregar al carrito
          </button>

          <button className="btn btn-secondary ms-2" onClick={() => navigate(`/carts/${id}`)}>
            Cancelar
          </button>
        </div></div>
    </div>
  );
}
