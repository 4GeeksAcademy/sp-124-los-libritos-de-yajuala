import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ProviderPanelButtons } from "../proveedores/ProviderPanelButtons";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ProviderBookDetail = () => {
  const [row, setRow] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [portadaPreview, setPortadaPreview] = useState(null);
  const fileInputRef = useRef(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const getMyProviderBook = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/provider/books/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert(data?.msg || "Error cargando libro del proveedor");
        navigate("/provider/books");
        return;
      }
      setRow(data);
    } catch (e) {
      alert("Error de red");
      navigate("/provider/books");
    }
  };

  useEffect(() => {
    if (!store.token) {
      navigate("/login/provider");
      return;
    }
    getMyProviderBook();
  }, [id, store.token]);

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

  if (!row) return <div className="container mt-5">Cargando...</div>;

  const book = row.libro;

  return (
    <div className="container mt-5">
      <ProviderPanelButtons />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Ficha del libro</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/provider/books")}>
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

          <div className="mb-4" style={{ position: "relative", display: "inline-block" }}>
            <img
              src={portadaPreview || book.portada || "https://via.placeholder.com/150x200?text=Sin+portada"}
              alt="Portada"
              style={{ width: "150px", height: "200px", objectFit: "cover", borderRadius: "4px", border: "1px solid #dee2e6" }}
            />
            <button
              className="btn btn-sm btn-dark"
              style={{ position: "absolute", bottom: 0, right: 0, borderRadius: "50%", width: "36px", height: "36px", padding: 0 }}
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              title="Cambiar portada"
            >
              {uploading ? "..." : <FontAwesomeIcon icon={faCamera} />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePortadaChange}
            />
          </div>

          <p><strong>Título:</strong> {book.titulo}</p>
          <p><strong>Autor:</strong> {book.autor}</p>
          <p><strong>ISBN:</strong> {book.isbn}</p>
          <p><strong>Precio:</strong> {book.precio} €</p>
          <p><strong>Categorías:</strong> {book.categorias || "—"}</p>
          <p><strong>Fecha publicación:</strong> {book.fecha_publicacion || "—"}</p>
          <p><strong>Cantidad:</strong> {row.cantidad}</p>
          <p><strong>Descripción:</strong></p>
          <p>{book.descripcion || "—"}</p>

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-warning" onClick={() => navigate(`/provider/books/${id}/edit`)}>
              Editar
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/provider/books")}>
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
