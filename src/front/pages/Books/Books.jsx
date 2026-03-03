import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";
import { faBookOpenReader, faImages, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  <div className="container-fluid py-4">

    <div className="d-flex justify-content-between align-items-start mb-4">
      <div>
        <nav className="breadcrumb">
          <span className="breadcrumb-item" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            Inicio
          </span>
          <span className="breadcrumb-item active">Libros</span>
        </nav>

        <h1 className="h2 mb-1">Catálogo de libros</h1>
        <p className="text-muted">{books.length} títulos disponibles</p>
      </div>

    </div>

    <div className="mb-4">
      <input
        type="text"
        className="form-control"
        style={{ maxWidth: "400px" }}
        placeholder={<FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" /> + " Buscar por título o autor..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {filtered.length === 0 ? (
      <div className="text-center py-5">
        <div className="fs-1"><FontAwesomeIcon icon={faImages} /></div>
        <h3>No hay libros</h3>
        <p className="text-muted">
          {search ? "No hay resultados para tu búsqueda." : "Aún no se han añadido libros."}
        </p>
        {!isClient && (
          <button className="btn btn-success" onClick={() => navigate("/books/new")}>
            Añadir primer libro
          </button>
        )}
      </div>
    ) : (
      <div className="row g-4">
        {filtered.map((book) => (
          <div key={book.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm" onClick={() => navigate(`/books/${book.id}`)} style={{ cursor: "pointer" }}>
              
              <div className="position-relative">
                {book.portada ? (
                  <img src={book.portada} className="card-img-top" alt={book.titulo} style={{ height: "260px", objectFit: "cover" }} />
                ) : (
                  <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: "260px" }}>
                    <span className="fs-1"><FontAwesomeIcon icon={faBookOpenReader} /></span>
                  </div>
                )}

                <span className="badge bg-primary position-absolute top-0 end-0 m-2">
                  {book.precio} €
                </span>
              </div>

              <div className="card-body">
                <h5 className="card-title">{book.titulo}</h5>
                <p className="card-text text-muted">{book.autor}</p>
              </div>

              <div className="card-footer bg-white border-0 d-flex justify-content-between">
                <button className="btn btn-outline-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/books/${book.id}`); }}>
                  Ver más
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};