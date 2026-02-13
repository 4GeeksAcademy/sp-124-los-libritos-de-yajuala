import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ProviderPanelButtons } from "../proveedores/ProviderPanelButtons";


export const ProviderBookCreate = () => {
  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    precio: "",
    cantidad: ""
  });

  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const createBook = async () => {
    try {
      if (!form.titulo || !form.autor || !form.isbn || !form.precio) {
        alert("Completa título, autor, ISBN y precio");
        return;
      }

      const resp = await fetch(`${backendUrl}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({
          titulo: form.titulo,
          autor: form.autor,
          isbn: form.isbn,
          precio: parseFloat(form.precio),
          cantidad: form.cantidad === "" ? 0 : parseInt(form.cantidad, 10)
        })
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error creando libro (${resp.status})`);
        return;
      }

      setForm({ titulo: "", autor: "", isbn: "", precio: "", cantidad: "" });
      navigate("/provider/books");
    } catch (error) {
      alert("Error de red");
    }
  };

  return (
    <div className="container mt-5">
      <ProviderPanelButtons />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Crear Libro (Proveedor)</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/provider/books")}>
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

          <label className="form-label">Cantidad</label>
          <input
            type="number"
            className="form-control mb-3"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            min="0"
            step="1"
          />

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate("/provider/books")}>
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
