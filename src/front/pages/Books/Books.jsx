import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const Books = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const getBooks = async () => {
    try {
      const resp = await fetch(backendUrl + "/api/books");
      const data = await resp.json();
      if (resp.ok) setBooks(data);
    } catch (error) {
      console.error("Error loading books", error);
    }
  };

  const deleteBook = async (bookId) => {
    try {
      const resp = await fetch(`${backendUrl}/api/books/${bookId}`, {
        method: "DELETE",
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || "Error eliminando libro");
        return;
      }

      getBooks();
    } catch (error) {
      alert("Error de red");
    }
  };

  useEffect(() => {
    getBooks();
  }, []);

  const role = store.user?.role;
	const isAdmin = role === "admin";
	const isProvider = role === "provider";
	const isDelivery = role === "delivery";
	const isClient = role === "client";

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Libros</h1>
      {!isClient && (
        <button className="btn btn-warning" onClick={() => navigate("/books/new")}>
          Crear libro
        </button>
      )}
        
      </div>

      <div className="row">
        {books.length === 0 ? (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-secondary">
              <div className="card-body">
                <h5 className="card-title text-muted">Sin libros</h5>
                <p className="card-text text-muted">Aún no hay libros creados</p>
              </div>
            </div>
          </div>
        ) : (
          books.map((book) => (
            <div key={book.id} className="col-12 col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{book.titulo}</h5>
                  <p className="card-text mb-1">
                    <strong>Autor:</strong> {book.autor}
                  </p>
                  <p className="card-text">
  <strong>Precio:</strong> {book.precio} €
</p>

                  
                  <p className="card-text">
                    <strong>ISBN:</strong> {book.isbn}
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      Ver ficha
                    </button>
                  {!isClient && (
                    <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/books/${book.id}/edit`)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteBook(book.id)}
                    >
                      Eliminar
                    </button></>
                  )}
                    
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
