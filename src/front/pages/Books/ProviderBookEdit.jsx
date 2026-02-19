import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ProviderPanelButtons } from "../proveedores/ProviderPanelButtons";

export const ProviderBookEdit = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const [row, setRow] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    precio: "",
    descripcion: "",
    portada: "",
    categorias: "",
    fecha_publicacion: "",
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

      const data = await resp.json();

      if (!resp.ok) {
        alert(data?.msg || `Error cargando (${resp.status})`);
        navigate("/provider/books");
        return;
      }

      setRow(data);

      const book = data.libro || {};
      setForm({
        titulo: book.titulo ?? "",
        autor: book.autor ?? "",
        isbn: book.isbn ?? "",
        precio: book.precio ?? "",
        descripcion: book.descripcion ?? "",
        portada: book.portada ?? "",
        categorias: book.categorias ?? "",
        fecha_publicacion: book.fecha_publicacion ?? "",
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

      await fetch(`${backendUrl}/api/provider/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify(form),
      });

      await fetch(`${backendUrl}/api/provider/books/${id}/cantidad`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({ cantidad: parseInt(form.cantidad) }),
      });

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
      <ProviderPanelButtons />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Editar libro</h1>
        <button className="btn btn-secondary" onClick={() => navigate(`/provider/books/${id}`)}>
          Volver
        </button>
      </div>

      <div className="card">
        <div className="card-body">

          <label className="form-label">Título</label>
          <input className="form-control mb-3" name="titulo" value={form.titulo} onChange={onChange} />

          <label className="form-label">Autor</label>
          <input className="form-control mb-3" name="autor" value={form.autor} onChange={onChange} />

          <label className="form-label">ISBN</label>
          <input className="form-control mb-3" name="isbn" value={form.isbn} onChange={onChange} />

          <label className="form-label">Precio (€)</label>
          <input type="number" className="form-control mb-3" name="precio" value={form.precio} onChange={onChange} />

          <label className="form-label">Descripción</label>
          <textarea className="form-control mb-3" name="descripcion" value={form.descripcion} onChange={onChange} />

          <label className="form-label">Portada (URL)</label>
          <input className="form-control mb-3" name="portada" value={form.portada} onChange={onChange} />

          <label className="form-label">Categorías</label>
          <input className="form-control mb-3" name="categorias" value={form.categorias} onChange={onChange} />

          <label className="form-label">Fecha publicación</label>
          <input className="form-control mb-3" name="fecha_publicacion" value={form.fecha_publicacion} onChange={onChange} />

          <label className="form-label">Cantidad</label>
          <input type="number" className="form-control mb-3" name="cantidad" value={form.cantidad} onChange={onChange} />

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
