import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import BookCoverFallback from "./BookCoverFallback";
import { faCartArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function RecommendedBooks() {
  const { store, actions } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/books/recommended`)
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  const handleAddToCart = (e, bookId) => {
    e.stopPropagation();

    if (!store.user || store.user.role !== "client") {
      alert("Debes iniciar sesión como cliente para añadir al carrito.");
      return;
    }

    actions.addToCart(bookId, 1);
    navigate("/user/cart");
  };

  return (
    <section className="py-5 bg-light">
      <div className="bk-container">
        <div className="bk-section-head">
          <h2>Recomendados para ti</h2>
          <p>Elegidos manualmente por nuestro equipo de expertos</p>
        </div>

        <div className="bk-books-grid">
          {books.map(b => (
            <div
              className="bk-book-card"
              key={b.id}
              onClick={() => navigate(`/books/${b.id}`)}
            >
              {b.portada ? (
                <img
                  src={b.portada}
                  alt={b.titulo}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0",
                    display: "block",
                  }}
                />
              ) : (
                <BookCoverFallback
                  title={b.titulo}
                  colorIdx={Math.floor(Math.random() * 5)}
                  height={180}
                />
              )}

              <div className="bk-book-info">
                <div className="bk-book-name">{b.titulo}</div>
                <div className="bk-book-author">por {b.autor}</div>

                <div className="bk-book-footer">
                  <span className="bk-book-price">€{b.precio}</span>
                </div>

                <button
                  className="bk-add-btn"
                  onClick={(e) => handleAddToCart(e, b.id)}
                >
                  <FontAwesomeIcon icon={faCartArrowDown} /> Añadir al carrito
                </button>
              </div>
            </div>
          ))}

          {books.length === 0 && (
            <p>No hay libros recomendados aún.</p>
          )}
        </div>
      </div>
    </section>
  );
}
