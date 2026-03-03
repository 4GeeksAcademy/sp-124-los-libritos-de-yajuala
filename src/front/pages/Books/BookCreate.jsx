import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const BookCreate = () => {
  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    precio: ""
  });

  const navigate = useNavigate();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const createBook = async () => {
    try {
      if (!form.titulo || !form.autor || !form.isbn || !form.precio) {
        alert("Completa título, autor, ISBN y precio");
        return;
      }


      const resp = await fetch(`${backendUrl}/api/books`, {
        method: "POST",
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
        alert(data?.msg || `Error creando libro (${resp.status})`);
        return;
      }

      setForm({ titulo: "", autor: "", isbn: "", precio: "" });

      navigate("/books");
    } catch (error) {
      alert("Error de red");
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Crear Libro</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/books")}>
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
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            step="0.01"
          />


          <label className="form-label">ISBN</label>
          <input
            className="form-control mb-3"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          />

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate("/books")}>
              Cancelar
            </button>
            <button className="btn btn-success" onClick={createBook}>
              Crear Libro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
