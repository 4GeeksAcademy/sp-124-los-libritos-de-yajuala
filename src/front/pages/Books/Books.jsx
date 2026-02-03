import React, { useEffect, useState } from "react";

export const Books = () => {
  const [books, setBooks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ titulo: "", autor: "", isbn: "" });

  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  console.log("VITE_BACKEND_URL =>", backendUrl);

  // GET libros
  const getBooks = async () => {
    try {
      const resp = await fetch(backendUrl + "/api/books");
      const data = await resp.json();
      if (resp.ok) setBooks(data);
    } catch (error) {
      console.error("Error loading books", error);
    }
  };

  // POST libro
  const createBook = async () => {
    try {
      if (!form.titulo || !form.autor || !form.isbn) {
        alert("Completa titulo, autor e isbn");
        return;
      }

      const resp = await fetch(`${backendUrl}/api/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error creando libro (${resp.status})`);
        return;
      }

      setForm({ titulo: "", autor: "", isbn: "" });
      setShowCreate(false);
      getBooks();
    } catch (error) {
      alert("Error de red");
    }
  };

  // PUT libro 
  const updateBook = async () => {
    try {
      if (!selectedBook) return;

      if (!form.titulo || !form.autor || !form.isbn) {
        alert("Completa titulo, autor e isbn");
        return;
      }

      const resp = await fetch(`${backendUrl}/api/books/${selectedBook.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error editando libro (${resp.status})`);
        return;
      }

      setShowEdit(false);
      setSelectedBook(null);
      setForm({ titulo: "", autor: "", isbn: "" });
      getBooks();
    } catch (error) {
      alert("Error de red");
    }
  };

  // DELETE libro
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

  return (
    <div className="container mt-5">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Libros</h1>
        <button className="btn btn-warning" onClick={() => setShowCreate(true)}>
          Crear libro
        </button>
      </div>


      <div className="row">
        {books.length === 0 ? (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-secondary">
              <div className="card-body">
                <h5 className="card-title text-muted">Sin libros</h5>
                <p className="card-text text-muted">Aún no hay libros creados</p>

                <div className="d-flex gap-2">
                  <button className="btn btn-info btn-sm" disabled>
                    Ver ficha
                  </button>
                  <button className="btn btn-primary btn-sm" disabled>
                    Editar
                  </button>
                  <button className="btn btn-danger btn-sm" disabled>
                    Eliminar
                  </button>
                </div>
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
                    <strong>ISBN:</strong> {book.isbn}
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => {
                        setSelectedBook(book);
                        setShowDetail(true);
                      }}
                    >
                      Ver ficha
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedBook(book);
                        setForm({
                          titulo: book.titulo,
                          autor: book.autor,
                          isbn: book.isbn,
                        });
                        setShowEdit(true);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteBook(book.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>


      {showCreate && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Crear Libro</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowCreate(false)}
                  />
                </div>

                <div className="modal-body">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control mb-3"
                    value={form.titulo}
                    onChange={(e) =>
                      setForm({ ...form, titulo: e.target.value })
                    }
                  />

                  <label className="form-label">Autor</label>
                  <input
                    className="form-control mb-3"
                    value={form.autor}
                    onChange={(e) =>
                      setForm({ ...form, autor: e.target.value })
                    }
                  />

                  <label className="form-label">ISBN</label>
                  <input
                    className="form-control"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancelar
                  </button>
                  <button className="btn btn-success" onClick={createBook}>
                    Crear Libro
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setShowCreate(false)}
          />
        </>
      )}


      {showDetail && selectedBook && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Ficha del libro</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowDetail(false)}
                  />
                </div>

                <div className="modal-body">
                  <p>
                    <strong>Título:</strong> {selectedBook.titulo}
                  </p>
                  <p>
                    <strong>Autor:</strong> {selectedBook.autor}
                  </p>
                  <p>
                    <strong>ISBN:</strong> {selectedBook.isbn}
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDetail(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setShowDetail(false)}
          />
        </>
      )}


      {showEdit && selectedBook && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar Libro</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowEdit(false)}
                  />
                </div>

                <div className="modal-body">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control mb-3"
                    value={form.titulo}
                    onChange={(e) =>
                      setForm({ ...form, titulo: e.target.value })
                    }
                  />

                  <label className="form-label">Autor</label>
                  <input
                    className="form-control mb-3"
                    value={form.autor}
                    onChange={(e) =>
                      setForm({ ...form, autor: e.target.value })
                    }
                  />

                  <label className="form-label">ISBN</label>
                  <input
                    className="form-control"
                    value={form.isbn}
                    onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowEdit(false)}
                  >
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={updateBook}>
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setShowEdit(false)}
          />
        </>
      )}
    </div>
  );
};
