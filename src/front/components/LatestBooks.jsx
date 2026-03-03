import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import BookCard from "./BookCard";
import { BOOK_COLORS } from "../constants/colors";

export default function LatestBooks() {
  const navigate = useNavigate();
  const { store, actions } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${backendUrl}/api/books/latest`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBooks(data);
        else setBooks([]);
      })
      .catch(() => setError("No se pudieron cargar los libros."))
      .finally(() => setLoading(false));
  }, []);

  const handleBuyBook = (book) => {
    if (!store.user || store.user.role !== "client") {
      alert("Debes iniciar sesión como cliente para comprar.");
      return;
    }
    actions.addToCart(book.id, 1);
    navigate("/user/cart");
  };

  return (
    <section className="bk-section">
      <div className="bk-container">

        <div className="bk-section-header">
          <h2>Últimos libros importados</h2>
          <Link to="/books" className="bk-section-link">Ver todos →</Link>
        </div>

        {loading && (
          <div className="bk-sale-loading">⏳ Cargando libros…</div>
        )}

        {error && !loading && (
          <div className="bk-sale-error">⚠️ {error}</div>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="bk-sale-empty">📭 No hay libros disponibles en este momento.</div>
        )}

        {!loading && !error && books.length > 0 && (
          <div className="bk-sale-grid">
            {books.map((book, idx) => (
              <BookCard
                key={book.id}
                book={book}
                colorIdx={idx % BOOK_COLORS.length}
                onBuy={() => handleBuyBook(book)}
                variant="sale"
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
