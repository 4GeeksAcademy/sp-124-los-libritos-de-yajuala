import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";

export const BookDetail = () => {
  const [book, setBook] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const isClient = store.user?.role === "client";

  useEffect(() => {
    fetch(`${backendUrl}/api/books/${id}`)
      .then((r) => r.json())
      .then((data) => setBook(data))
      .catch(() => navigate("/books"));
  }, [id]);

  if (!book) return <div className="cl-page"><div className="cl-loader">Cargando libro</div></div>;

  return (
    <div className="cl-page cl-page-wide">

      {/* Breadcrumb */}
      <div className="cl-breadcrumb" style={{ marginBottom: "28px" }}>
        <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Inicio</span>
        <span>›</span>
        <span onClick={() => navigate("/books")} style={{ cursor: "pointer" }}>Libros</span>
        <span>›</span>
        <span style={{ color: "var(--cl-text)" }}>{book.titulo}</span>
      </div>

      <div className="cl-book-detail-layout">

        {/* Portada */}
        <div className="cl-book-detail-cover">
          {book.portada
            ? <img src={book.portada} alt={book.titulo} />
            : "📖"
          }
        </div>

        {/* Info */}
        <div>
          <h1 className="cl-book-detail-title">{book.titulo}</h1>
          <p className="cl-book-detail-author">por {book.autor}</p>
          <div className="cl-book-detail-price">{book.precio} €</div>

          {book.descripcion && (
            <p className="cl-book-detail-desc">{book.descripcion}</p>
          )}

          {/* Metadatos */}
          <div className="cl-book-detail-meta">
            {book.isbn && (
              <div className="cl-book-detail-meta-row">
                <span className="cl-book-detail-meta-label">ISBN</span>
                <span>{book.isbn}</span>
              </div>
            )}
            {book.categorias?.length > 0 && (
              <div className="cl-book-detail-meta-row">
                <span className="cl-book-detail-meta-label">Categorías</span>
                <span style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {book.categorias.map((c, i) => (
                    <span key={i} style={{
                      background: "var(--cl-bg)",
                      border: "1px solid var(--cl-border)",
                      borderRadius: "20px",
                      padding: "2px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--cl-blue)"
                    }}>{c.nombre || c}</span>
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {isClient && (
              <button
                className="cl-btn cl-btn-accent cl-btn-lg"
                onClick={() => navigate("/user/cart")}
              >
                🛒 Añadir al carrito
              </button>
            )}
            {!isClient && (
              <button className="cl-btn cl-btn-primary cl-btn-lg" onClick={() => navigate(`/books/${book.id}/edit`)}>
                ✏️ Editar libro
              </button>
            )}
            <button className="cl-btn cl-btn-ghost cl-btn-lg" onClick={() => navigate("/books")}>
              ← Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
