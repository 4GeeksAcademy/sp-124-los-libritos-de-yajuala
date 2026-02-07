import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const BookDetail = () => {
  const [book, setBook] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

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
    } catch (error) {
      alert("Error de red");
    }
  };

  useEffect(() => {
    getBook();
  }, [id]);

  if (!book) return <div className="container mt-5">Cargando...</div>;

  const role = store.user?.role;
	const isAdmin = role === "admin";
	const isProvider = role === "provider";
	const isDelivery = role === "delivery";
	const isClient = role === "client";

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Ficha del libro</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/books")}>
          Volver
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <p><strong>Título:</strong> {book.titulo}</p>
          <p><strong>Autor:</strong> {book.autor}</p>
          <p><strong>Precio:</strong> {book.precio} €</p>
          <p><strong>ISBN:</strong> {book.isbn}</p>

          <div className="d-flex gap-2">
            {!isClient && (
              <button className="btn btn-primary" onClick={() => navigate(`/books/${book.id}/edit`)}>
              Editar
            </button>
            )}
            
            <button className="btn btn-secondary" onClick={() => navigate("/books")}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
