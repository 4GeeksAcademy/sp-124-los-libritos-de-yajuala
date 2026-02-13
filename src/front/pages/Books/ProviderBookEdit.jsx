import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const ProviderBookEdit = () => {
  const { id } = useParams(); // id = provider_book_id
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const [row, setRow] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    precio: "",
    cantidad: ""
  });

  const getRow = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/provider/books/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error cargando (${resp.status})`);
        navigate("/provider/books");
        return;
      }

      setRow(data);

      const book = data?.libro || {};
      setForm({
        titulo: book.titulo ?? "",
        autor: book.autor ?? "",
        isbn: book.isbn ?? "",
        precio: book.precio ?? "",
        cantidad: data.cantidad ?? ""
      });
    } catch (e) {
      alert("Error de red");
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    try {
      const payload = {
        titulo: form.titulo,
        autor: form.autor,
        isbn: form.isbn,
        precio: form.precio === "" ? "" : parseFloat(form.precio),
        cantidad: form.cantidad === "" ? "" : parseInt(form.cantidad, 10),
      };

      const resp = await fetch(`${backendUrl}/api/provider/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify(payload),
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error guardando (${resp.status})`);
        return;
      }

      navigate(`/provider/books/${id}`);
    } catch (e) {
      alert("Error de red");
    }
  };

  useEffect(() => {
    if (!store.token) {
      navigate("/login/provider");
      return;
    }
    getRow();
  }, [id, store.token]);

  if (!row) return <div className="container mt-5">Cargando...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Editar libro</h1>
        <button className="btn btn-secondary" onClick={() => navigate(`/provider/books/${id}`)}>
          Volver
        </button>
      </div>

      <div className="card">
        <div className="card-body">

          <label className="form-label">Título</label>
          <input
            type="text"
            className="form-control mb-3"
            name="titulo"
            value={form.titulo}
            onChange={onChange}
          />

          <label className="form-label">Autor</label>
          <input
            type="text"
            className="form-control mb-3"
            name="autor"
            value={form.autor}
            onChange={onChange}
          />

          <label className="form-label">ISBN</label>
          <input
            type="text"
            className="form-control mb-3"
            name="isbn"
            value={form.isbn}
            onChange={onChange}
          />

          <label className="form-label">Precio (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-control mb-3"
            name="precio"
            value={form.precio}
            onChange={onChange}
          />

          <label className="form-label">Cantidad</label>
          <input
            type="number"
            className="form-control mb-3"
            name="cantidad"
            value={form.cantidad}
            onChange={onChange}
            min="0"
          />

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate(`/provider/books/${id}`)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={save}>
              Guardar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
