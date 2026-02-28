import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ProviderPanelButtons } from "../proveedores/ProviderPanelButtons";

export const ProviderBookCreate = () => {
  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categorias: [] 
  });
  const [portadaFile, setPortadaFile] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [allCategories, setAllCategories] = useState([]);

  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

  useEffect(() => {
    fetch(`${backendUrl}/api/categorias`)
      .then(res => res.json())
      .then(data => setAllCategories(data));
  }, []);

  const toggleCategory = (id) => {
    setForm(prev => ({
      ...prev,
      categorias: prev.categorias.includes(id)
        ? prev.categorias.filter(c => c !== id)
        : [...prev.categorias, id]
    }));
  };
  const handlePortadaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPortadaFile(file);
    setPortadaPreview(URL.createObjectURL(file));
  };

  const createBook = async () => {
    if (!form.titulo || !form.autor || !form.precio) {
      alert("Completa título, autor y precio");
      return;
    }

    setUploading(true);

    const resp = await fetch(`${backendUrl}/api/books/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`,
      },
      body: JSON.stringify({
        titulo: form.titulo,
        autor: form.autor,
        isbn: form.isbn || null,
        descripcion: form.descripcion,
        portada: null,
        precio: parseFloat(form.precio)
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      alert(data.msg || "Error creando libro");
      setUploading(false);
      return;
    }

    const bookId = data.id;

    if (portadaFile) {
      const formData = new FormData();
      formData.append("portada", portadaFile);

      const portadaResp = await fetch(`${backendUrl}/api/books/${bookId}/portada`, {
        method: "PUT",
        body: formData,
      });

      if (!portadaResp.ok) {
        alert("Libro creado pero error subiendo la portada");
      }
    }

    await fetch(`${backendUrl}/api/provider/${store.user.id}/add_book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`,
      },
      body: JSON.stringify({
        book_id: bookId,
        cantidad: parseInt(form.cantidad || 0)
      })
    });

    setUploading(false);
    alert("Libro creado y asociado correctamente");
    navigate("/provider/books");
  };

  return (
    <div className="container mt-5">
      <ProviderPanelButtons />
      <h1>Crear Libro (Proveedor)</h1>

      <div className="card mt-3">
        <div className="card-body">
          <label className="form-label">Título</label>
          <input className="form-control mb-3" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />

          <label className="form-label">Autor</label>
          <input className="form-control mb-3" value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} />

          <label className="form-label">ISBN</label>
          <input className="form-control mb-3" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />

          <label className="form-label">Descripción</label>
          <textarea className="form-control mb-3" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

          <label className="form-label">Portada</label>
          <div className="mb-3">
            {portadaPreview && (
              <img
                src={portadaPreview}
                alt="Preview portada"
                className="mb-2 d-block"
                style={{ width: "150px", height: "200px", objectFit: "cover", borderRadius: "4px" }}
              />
            )}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fileInputRef.current.click()}
            >
              {portadaPreview ? "Cambiar imagen" : "Subir portada"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePortadaChange}
            />
          </div>

          <label className="form-label">Precio (€)</label>
          <input type="number" className="form-control mb-3" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />

          <label className="form-label">Cantidad inicial</label>
          <input type="number" className="form-control mb-3" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />

          <label className="form-label">Categorías</label>
          <div className="mb-3">
            {allCategories.map(cat => (
              <div key={cat.id} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={form.categorias.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
                <label className="form-check-label">
                  {cat.nombre}
                </label>
              </div>
            ))}
          </div>

          <button className="btn btn-success" onClick={createBook} disabled={uploading}>
            {uploading ? "Creando..." : "Crear libro"}
          </button>
        </div>
      </div>
    </div>
  );
};