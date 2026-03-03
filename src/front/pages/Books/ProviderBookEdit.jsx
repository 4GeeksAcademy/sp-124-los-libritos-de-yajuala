import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ProviderPanelButtons } from "../proveedores/ProviderPanelButtons";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ProviderBookEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const fileInputRef = useRef(null);

  const [row, setRow] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [portadaPreview, setPortadaPreview] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    precio: "",
    descripcion: "",
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
        categorias: book.categorias ?? "",
        fecha_publicacion: book.fecha_publicacion ?? "",
        cantidad: data.cantidad ?? ""
      });
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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePortadaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPortadaPreview(URL.createObjectURL(file));
    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("portada", file);

    try {
      const resp = await fetch(`${backendUrl}/api/books/${row.libro.id}/portada`, {
        method: "PUT",
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMessage("Error subiendo portada");
        return;
      }
      setRow((prev) => ({ ...prev, libro: { ...prev.libro, portada: data.portada } }));
      setMessage("Portada actualizada");
    } catch {
      setMessage("Error de conexión");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/provider/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify(form),
      });

      if (!resp.ok) {
        const data = await resp.json();
        alert(data.msg || "Error guardando");
        return;
      }

      navigate(`/provider/books/${id}`);
    } catch (e) {
      alert("Error de red");
    }
  };

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

      {message && (
        <div className={`alert ${message.includes("Error") ? "alert-danger" : "alert-success"} py-2`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card-body">

          
          <label className="form-label">Portada</label>
          <div className="mb-3">
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={portadaPreview || row.libro?.portada || "https://via.placeholder.com/150x200?text=Sin+portada"}
                alt="Portada"
                style={{ width: "150px", height: "200px", objectFit: "cover", borderRadius: "4px", border: "1px solid #dee2e6" }}
              />
              <button
                type="button"
                className="btn btn-sm btn-dark"
                style={{ position: "absolute", bottom: 0, right: 0, borderRadius: "50%", width: "36px", height: "36px", padding: 0 }}
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                title="Cambiar portada"
              >
                {uploading ? "..." : <FontAwesomeIcon icon={faCamera} />}
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePortadaChange}
            />
          </div>

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
