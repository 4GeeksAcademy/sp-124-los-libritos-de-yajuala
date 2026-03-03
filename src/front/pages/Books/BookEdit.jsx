import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const BookEdit = () => {
  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    precio: ""
  });


  const [book, setBook] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const getBook = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/books/${id}`);
      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || "Error cargando libro");
        navigate("/books");
        return;
      }

      setBook(data);
      setForm({
        titulo: data.titulo,
        autor: data.autor,
        isbn: data.isbn,
        precio: data.precio
      });

    } catch (error) {
      alert("Error de red");
    }
  };

  const updateBook = async () => {
    try {
      if (!form.titulo || !form.autor || !form.isbn || !form.precio) {
        alert("Completa título, autor, ISBN y precio");
        return;
      }


      const resp = await fetch(`${backendUrl}/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          autor: form.autor,
          isbn: form.isbn,
          precio: parseFloat(form.precio)
        })
      });


      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error editando libro (${resp.status})`);
        return;
      }

      navigate(`/books/${id}`);
    } catch (error) {
      alert("Error de red");
    }
  };

  useEffect(() => {
    getBook();
  }, [id]);

  if (!book) return <div className="container mt-5">Cargando...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Editar Libro</h1>
        <button className="btn btn-secondary" onClick={() => navigate(`/books/${id}`)}>
          Volver
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <label className="form-label">Título</label>
          <input
            className="form-control mb-3"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />

          <label className="form-label">Autor</label>
          <input
            className="form-control mb-3"
            value={form.autor}
            onChange={(e) => setForm({ ...form, autor: e.target.value })}
          />

          <label className="form-label">Precio</label>
          <input
            type="number"
            className="form-control mb-3"
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            step="0.01"
            value={form.precio ?? ""}

          />


          <label className="form-label">ISBN</label>
          <input
            className="form-control mb-3"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          />

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate(`/books/${id}`)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={updateBook}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
