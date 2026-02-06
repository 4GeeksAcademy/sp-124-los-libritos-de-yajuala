import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const getReviews = async () => {
    try {
      const resp = await fetch(backendUrl + "/api/reviews");
      const data = await resp.json();
      if (resp.ok) setReviews(data);
    } catch (error) {
      console.error("Error loading reviews", error);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const resp = await fetch(`${backendUrl}/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || "Error eliminando review");
        return;
      }

      getReviews();
    } catch (error) {
      alert("Error de red");
    }
  };

  useEffect(() => {
    getReviews();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Reviews</h1>
        <button className="btn btn-warning" onClick={() => navigate("/reviews/new")}>
          Crear review
        </button>
      </div>

      <div className="row">
        {reviews.length === 0 ? (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-secondary">
              <div className="card-body">
                <h5 className="card-title text-muted">Sin reviews</h5>
                <p className="card-text text-muted">Aún no hay reviews creadas</p>
              </div>
            </div>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="col-12 col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    Review #{review.id}{" "}
                    <span className="badge bg-dark ms-2">{review.puntuacion}/5</span>
                  </h5>

                  <p className="card-text mb-1">
                    <strong>ID Cliente:</strong> {review.id_cliente}
                  </p>
                  <p className="card-text mb-1">
                    <strong>ID Libro:</strong> {review.id_libro}
                  </p>

                  {review.comentario ? (
                    <p className="card-text">
                      <strong>Comentario:</strong> {review.comentario}
                    </p>
                  ) : (
                    <p className="card-text text-muted mb-2">Sin comentario</p>
                  )}

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => navigate(`/reviews/${review.id}`)}
                    >
                      Ver ficha
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/reviews/${review.id}/edit`)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteReview(review.id)}
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
    </div>
  );
};
