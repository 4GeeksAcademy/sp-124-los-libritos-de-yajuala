import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (!confirm("¿Eliminar esta reseña?")) return;
    await fetch(`${backendUrl}/api/reviews/${id}`, { method: "DELETE" });
    getReviews();
  };

  useEffect(() => {
    getReviews();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Cargando reseñas…</p>
      </div>
    );
  }

  return (
    <div className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Reseñas de lectores</h1>
          <p className="text-muted">{reviews.length} reseñas publicadas</p>
        </div>

        {user && (
          <button
            className="btn btn-primary"
            onClick={() => navigate("/reviews/new")}
          >
            + Escribir reseña
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-5 border rounded bg-light">
          <div style={{ fontSize: "3rem" }}>⭐</div>
          <h4 className="mt-3">Sin reseñas todavía</h4>
          <p className="text-muted">
            Sé el primero en dejar tu opinión sobre un libro.
          </p>

          {user && (
            <button
              className="btn btn-primary mt-2"
              onClick={() => navigate("/reviews/new")}
            >
              Escribir primera reseña
            </button>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {reviews.map((review) => (
            <div key={review.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">Libro #{review.id_libro}</span>

                    <div className="text-warning">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i}>
                          {i <= review.puntuacion ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>

                  {review.comentario ? (
                    <p className="fst-italic">"{review.comentario}"</p>
                  ) : (
                    <p className="text-muted fst-italic small">Sin comentario</p>
                  )}

                  <p className="text-muted small mb-2">
                    Cliente #{review.id_cliente}
                  </p>

                  {(isAdmin || isOwner(review)) && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate(`/reviews/${review.id}/edit`)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => deleteReview(review.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
