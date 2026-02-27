import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function ProviderBookSearch() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState("title");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchBooks = async () => {
    if (!query.trim()) return;
    setError("");
    setLoading(true);

    try {
      const resp = await fetch(
        `${backendUrl}/api/books/search?q=${encodeURIComponent(query)}&type=${searchType}`
      );
      const data = await resp.json();

      if (!resp.ok) {
        setError(data.msg || "Error en la búsqueda");
        setResults([]);
        return;
      }

      if (!Array.isArray(data)) {
        setError("La API de búsqueda no está disponible en este momento. Inténtalo más tarde.");
        setResults([]);
        return;
      }

      setResults(data);
    } catch (err) {
      setError("Error de conexión con el servidor");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const importBook = async (book) => {
    if (!store.user?.id || store.user.role !== "provider") {
      alert("Debes iniciar sesión como proveedor.");
      return;
    }

    const cantidad = prompt("¿Cuántas unidades quieres añadir?", "1");
    if (!cantidad || isNaN(cantidad)) return alert("Cantidad inválida");

    const precio = prompt("¿Precio de venta (€)?", "10.00");
    if (!precio || isNaN(precio)) return alert("Precio inválido");

    const resp = await fetch(`${backendUrl}/api/books/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`,
      },
      body: JSON.stringify({
        titulo: book.titulo,
        autor: book.autor,
        isbn: book.isbn,
        descripcion: book.descripcion,
        portada: book.portada,
        precio: parseFloat(precio),
        categorias: book.categorias || [],
      }),
    });

    const savedBook = await resp.json();
    if (!resp.ok) return alert(savedBook.msg || "Error importando libro");

    const resp2 = await fetch(
      `${backendUrl}/api/provider/${store.user.id}/add_book`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({
          book_id: savedBook.id,
          cantidad: parseInt(cantidad),
        }),
      }
    );

    const data2 = await resp2.json();
    if (!resp2.ok) return alert(data2.msg || "Error asociando libro");

    alert("Libro importado y asociado correctamente");
  };

  return (
    <div className="container mt-4">
      <h1>Buscar libros</h1>

      <div className="d-flex gap-2 mb-3">
        <button
          style={searchType === "title" ? styles.btnPrimary : styles.btnOutline}
          onClick={() => setSearchType("title")}
        >
          Buscar por título
        </button>
        <button
          style={searchType === "author" ? styles.btnPrimary : styles.btnOutline}
          onClick={() => setSearchType("author")}
        >
          Buscar por autor
        </button>
      </div>

      <div className="input-group mb-3">
        <input
          className="form-control"
          placeholder="Introduce tu búsqueda..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchBooks()}
        />
        <button style={styles.btnPrimary} onClick={searchBooks} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {error && (
        <div className="alert alert-warning">{error}</div>
      )}

      <div className="row">
        {results.map((book, i) => (
          <div key={i} className="col-md-4 mb-3">
            <div className="card h-100">
              {book.portada && (
                <img
                  src={book.portada}
                  className="card-img-top"
                  alt={book.titulo}
                  style={{ height: "250px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{book.titulo}</h5>
                <p className="card-text">
                  <strong>Autor:</strong> {book.autor || "Desconocido"} <br />
                  <strong>ISBN:</strong> {book.isbn || "N/A"} <br />
                  <small>{book.descripcion || "Sin descripción"}</small>
                </p>
                <button style={{...styles.btnPrimary, width: "100%"}} onClick={() => importBook(book)}>
                  Importar libro
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        style={{...styles.btnNeutral, marginTop: 16}}
        onClick={() => navigate("/provider/books/new")}
      >
        Crear libro manualmente
      </button>
    </div>
  );
}

const styles = {
  btnPrimary: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnOutline: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #2563eb",
    background: "transparent",
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnNeutral: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
  },
};