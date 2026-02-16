import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminReviewList() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data));
  }, []);

  const deleteReview = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta review?")) return;

    const resp = await fetch(`${backendUrl}/api/reviews/${id}`, {
      method: "DELETE"
    });

    if (resp.ok) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  return (
    <div>
      <h1>Reviews</h1>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Libro</th>
            <th>Puntuación</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {reviews.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.id_cliente}</td>
              <td>{r.id_libro}</td>
              <td>{r.puntuacion}</td>
              <td>
                <Link
                  to={`/admin/reviews/${r.id}`}
                  className="btn btn-info btn-sm me-2"
                >
                  Ver
                </Link>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteReview(r.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
