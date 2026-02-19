import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function ProviderBookSearch() {
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const API_BASE = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchBooks = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/api/books/search?q=${encodeURIComponent(query)}`);
      const data = await resp.json();

      if (!resp.ok) {
        alert(data?.msg || "Error buscando libros");
        setLoading(false);
        return;
      }

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Error de red buscando libros");
    }

    setLoading(false);
  };

  const importBook = async (book) => {
  if (!store.token || store.user?.role !== "provider") {
    alert("Debes iniciar sesión como proveedor.");
    navigate("/login/provider");
    return;
  }

  const cantidad = prompt("¿Cuántas unidades quieres añadir?", "1");
  if (!cantidad || isNaN(cantidad)) return alert("Cantidad inválida");

  const precio = prompt("¿Precio de venta (€)?", "10.00");
  if (!precio || isNaN(precio)) return alert("Precio inválido");

  const resp = await fetch(`${API_BASE}/api/books/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${store.token}`,
    },
    body: JSON.stringify({
      ...book,
      precio: parseFloat(precio)
    }),
  });

  const savedBook = await resp.json();
  if (!resp.ok) return alert(savedBook.msg || "Error importando libro");

  const providerId = store.user.id;

  const resp2 = await fetch(`${API_BASE}/api/provider/${providerId}/add_book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${store.token}`,
    },
    body: JSON.stringify({
      book_id: savedBook.id,
      cantidad: parseInt(cantidad),
    }),
  });

  const data2 = await resp2.json();
  if (!resp2.ok) return alert(data2.msg || "Error asociando libro");

  alert("Libro importado y asociado correctamente");
  navigate("/provider/books");
};


  return (
    <div className="container mt-5">
      <h1>Buscar libros para importar</h1>

      <div className="input-group mt-4 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Título, autor o ISBN"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={searchBooks}>
          Buscar
        </button>
      </div>

      {loading && <p>Cargando resultados...</p>}

      {results.length > 0 && (
        <div>
          <h3>Resultados</h3>

          {results.map((book, index) => (
            <div key={index} className="card p-3 mb-3">
              <div className="row">
                <div className="col-md-2">
                  {book.portada ? (
                    <img
                      src={book.portada}
                      alt={book.titulo}
                      className="img-fluid"
                    />
                  ) : (
                    <div className="bg-light text-center p-3">
                      Sin portada
                    </div>
                  )}
                </div>

                <div className="col-md-10">
                  <h4>{book.titulo}</h4>
                  <p><strong>Autor:</strong> {book.autor}</p>
                  <p><strong>ISBN:</strong> {book.isbn}</p>
                  <p>{book.descripcion?.slice(0, 200)}...</p>

                  <button
                    className="btn btn-success"
                    onClick={() => importBook(book)}
                  >
                    Importar libro
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
