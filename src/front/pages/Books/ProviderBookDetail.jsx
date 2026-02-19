import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ProviderPanelButtons } from "../proveedores/ProviderPanelButtons";

export const ProviderBookDetail = () => {
  const [row, setRow] = useState(null);
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

      <div className="card">
        <div className="card-body">

          {book.portada && (
            <img src={book.portada} alt="Portada" className="img-fluid mb-3" />
          )}

          <p><strong>Título:</strong> {book.titulo}</p>
          <p><strong>Autor:</strong> {book.autor}</p>
          <p><strong>ISBN:</strong> {book.isbn}</p>
          <p><strong>Precio:</strong> {book.precio} €</p>
          <p><strong>Categorías:</strong> {book.categorias}</p>
          <p><strong>Fecha publicación:</strong> {book.fecha_publicacion}</p>
          <p><strong>Cantidad:</strong> {row.cantidad}</p>

          <p><strong>Descripción:</strong></p>
          <p>{book.descripcion}</p>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-warning"
              onClick={() => navigate(`/provider/books/${id}/edit`)}
            >
              Editar
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigate("/provider/books")}
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
