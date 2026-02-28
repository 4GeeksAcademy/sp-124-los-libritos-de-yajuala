import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";
import "../../styles/client.css";

const Stars = ({ n }) => (
  <div className="cl-stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`cl-star${i <= n ? " filled" : ""}`}>★</span>
    ))}
  </div>
);

export const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const { store } = useGlobalReducer();
  const user = store.user;
  const isAdmin = user?.role === "admin";
  const isOwner = (r) => user && r.id_cliente === user.id;

  const getReviews = async () => {
    setLoading(true);
    try {
      const resp = await fetch(backendUrl + "/api/reviews");
      const data = await resp.json();
      if (resp.ok) setReviews(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const deleteReview = async (id) => {
    if (!confirm("¿Eliminar esta reseña?")) return;
    await fetch(`${backendUrl}/api/reviews/${id}`, { method: "DELETE" });
    getReviews();
  };

  useEffect(() => { getReviews(); }, []);

  if (loading) return <div className="cl-page"><div className="cl-loader">Cargando reseñas</div></div>;

  return (
    <div className="cl-page cl-page-wide">

      <div className="cl-page-header">
        <div className="cl-page-header-left">
          <h1 className="cl-title">Reseñas de lectores</h1>
          <p className="cl-subtitle">{reviews.length} reseñas publicadas</p>
        </div>
        {user && (
          <button className="cl-btn cl-btn-accent" onClick={() => navigate("/reviews/new")}>
            + Escribir reseña
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="cl-empty">
          <div className="cl-empty-icon">⭐</div>
          <p className="cl-empty-title">Sin reseñas todavía</p>
          <p className="cl-empty-text">Sé el primero en dejar tu opinión sobre un libro.</p>
          {user && (
            <button className="cl-btn cl-btn-accent" onClick={() => navigate("/reviews/new")}>
              Escribir primera reseña
            </button>
          )}
        </div>
      ) : (
        <div className="cl-reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="cl-review-card">
              <div className="cl-review-header">
                <span className="cl-review-book">Libro #{review.id_libro}</span>
                <Stars n={review.puntuacion} />
              </div>
              {review.comentario ? (
                <p className="cl-review-comment">"{review.comentario}"</p>
              ) : (
                <p style={{ fontSize: "12px", color: "var(--cl-text-muted)", fontStyle: "italic" }}>Sin comentario</p>
              )}
              <p style={{ fontSize: "11px", color: "var(--cl-text-muted)", margin: 0 }}>
                Cliente #{review.id_cliente}
              </p>
              {(isAdmin || isOwner(review)) && (
                <div className="cl-review-actions">
                  <button className="cl-btn cl-btn-primary cl-btn-sm" onClick={() => navigate(`/reviews/${review.id}/edit`)}>
                    Editar
                  </button>
                  <button className="cl-btn cl-btn-danger cl-btn-sm" onClick={() => deleteReview(review.id)}>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
