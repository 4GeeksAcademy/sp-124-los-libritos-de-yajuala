import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { faCartArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function HeroSection() {
  const { store, actions } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [bestSeller, setBestSeller] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/books/best-seller`)
      .then(res => res.json())
      .then(data => setBestSeller(data));
  }, []);

  const handleBuyNow = () => {
    if (!store.user || store.user.role !== "client") {
      alert("Debes iniciar sesión como cliente para comprar este libro.");
      return;
    }

    actions.addToCart(bestSeller.id, 1);
    navigate("/user/cart");
  };

  const handleSeeDetails = () => {
    if (!bestSeller) return;
    navigate(`/books/${bestSeller.id}`);
  };

  const book = bestSeller || {
    titulo: "Próximamente",
    autor: "—",
    precio: 0,
    portada: "/placeholder.jpg",
    descripcion: "Aún no hay libros vendidos, pero pronto aparecerá aquí el más popular."
  };

  return (
    <section className="bk-hero">
      <div className="bk-container">
        <div className="bk-hero-content">
          <div className="bk-hero-text">
            <span className="bk-hero-badge">
              {bestSeller ? "Más vendido" : "Sin datos aún"}
            </span>

            <h1 className="bk-hero-title">
              {book.titulo}
            </h1>

            <p className="bk-hero-desc">
              {book.descripcion || "Descubre miles de libros de todos los géneros."}
            </p>

            {bestSeller && (
              <div className="bk-hero-price">
                <span className="current">€{book.precio.toFixed(2)}</span>
              </div>
            )}

            <div className="bk-hero-btns">
              <button
                className="bk-btn bk-btn-primary"
                onClick={handleBuyNow}
                disabled={!bestSeller}
              >
                <FontAwesomeIcon icon={faCartArrowDown} /> Buy Now
              </button>

              <button
                className="bk-btn bk-btn-outline"
                onClick={handleSeeDetails}
                disabled={!bestSeller}
              >
                See Details
              </button>
            </div>
          </div>

          <div className="bk-hero-book">
            <div className="bk-hero-book-cover">
              {book.portada ? (
                <img
                  src={book.portada}
                  alt={book.titulo}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "inherit",
                    display: "block",
                  }}
                />
              ) : (
                <>
                  <div className="bk-hero-book-title">{book.titulo}</div>
                  <div className="bk-hero-book-author">by {book.autor}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
