import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";

export const Books = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const isClient = store.user?.role === "client";

  const getBooks = async () => {
    setLoading(true);
    try {
      const resp = await fetch(backendUrl + "/api/books");
      const data = await resp.json();
      if (resp.ok) setBooks(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const deleteBook = async (bookId) => {
    if (!confirm("¿Eliminar este libro?")) return;
    try {
      const resp = await fetch(`${backendUrl}/api/books/${bookId}`, { method: "DELETE" });
      if (resp.ok) getBooks();
    } catch (e) { alert("Error de red"); }
  };

  useEffect(() => { getBooks(); }, []);

  const filtered = books.filter((b) =>
    b.titulo.toLowerCase().includes(search.toLowerCase()) ||
    b.autor.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="cl-page"><div className="cl-loader">Cargando libros</div></div>;

  return (
    <div className="cl-page cl-page-wide">

      {/* Cabecera */}
      <div className="cl-page-header">
        <div className="cl-page-header-left">
          <div className="cl-breadcrumb">
            <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Inicio</span>
            <span>›</span>
            <span>Libros</span>
          </div>
          <h1 className="cl-title">Catálogo de libros</h1>
          <p className="cl-subtitle">{books.length} títulos disponibles</p>
        </div>
        {!isClient && (
          <button className="cl-btn cl-btn-accent" onClick={() => navigate("/books/new")}>
            + Nuevo libro
          </button>
        )}
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: "28px" }}>
        <input
          className="cl-input"
          style={{ maxWidth: "400px" }}
          placeholder="🔍  Buscar por título o autor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="cl-empty">
          <div className="cl-empty-icon">📚</div>
          <p className="cl-empty-title">No hay libros</p>
          <p className="cl-empty-text">{search ? "No hay resultados para tu búsqueda." : "Aún no se han añadido libros."}</p>
          {!isClient && (
            <button className="cl-btn cl-btn-accent" onClick={() => navigate("/books/new")}>Añadir primer libro</button>
          )}
        </div>
      ) : (
        <div className="cl-books-grid">
          {filtered.map((book) => (
            <div key={book.id} className="cl-book-card" onClick={() => navigate(`/books/${book.id}`)}>
              <div className="cl-book-cover">
                {book.portada
                  ? <img src={book.portada} alt={book.titulo} />
                  : <span className="cl-book-cover-placeholder">📖</span>
                }
                <span className="cl-book-price-badge">{book.precio} €</span>
              </div>
              <div className="cl-book-info">
                <h3 className="cl-book-title">{book.titulo}</h3>
                <p className="cl-book-author">{book.autor}</p>
              </div>
              <div className="cl-book-actions" onClick={(e) => e.stopPropagation()}>
                <button className="cl-btn cl-btn-ghost cl-btn-sm" onClick={() => navigate(`/books/${book.id}`)}>
                  Ver más
                </button>
                {!isClient && (
                  <>
                    <button className="cl-btn cl-btn-primary cl-btn-sm" onClick={() => navigate(`/books/${book.id}/edit`)}>
                      Editar
                    </button>
                    <button className="cl-btn cl-btn-danger cl-btn-sm" onClick={() => deleteBook(book.id)}>
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
