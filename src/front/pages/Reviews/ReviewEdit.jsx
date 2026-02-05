import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const ReviewEdit = () => {
  const [form, setForm] = useState({
    id_cliente: "",
    id_libro: "",
    puntuacion: "",
    comentario: "",
  });
  const [review, setReview] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const getReview = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/reviews/${id}`);
      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || "Error cargando review");
        navigate("/reviews");
        return;
      }

      setReview(data);
      setForm({
        id_cliente: data.id_cliente ?? "",
        id_libro: data.id_libro ?? "",
        puntuacion: data.puntuacion ?? "",
        comentario: data.comentario ?? "",
      });
    } catch (error) {
      alert("Error de red");
    }
  };

  const updateReview = async () => {
    try {
      if (!form.id_cliente || !form.id_libro || !form.puntuacion) {
        alert("Completa id_cliente, id_libro y puntuacion");
        return;
      }

      const payload = {
        id_cliente: Number(form.id_cliente),
        id_libro: Number(form.id_libro),
        puntuacion: Number(form.puntuacion),
        comentario: form.comentario || null,
      };

      const resp = await fetch(`${backendUrl}/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error editando review (${resp.status})`);
        return;
      }

      navigate(`/reviews/${id}`);
    } catch (error) {
      alert("Error de red");
    }
  };

  useEffect(() => {
    getReview();
  }, [id]);

  if (!review) return <div className="container mt-5">Cargando...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Editar Review</h1>
        <button className="btn btn-secondary" onClick={() => navigate(`/reviews/${id}`)}>
          Volver
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <label className="form-label">ID Cliente</label>
          <input
            type="number"
            className="form-control mb-3"
            value={form.id_cliente}
            onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
          />

          <label className="form-label">ID Libro</label>
          <input
            type="number"
            className="form-control mb-3"
            value={form.id_libro}
            onChange={(e) => setForm({ ...form, id_libro: e.target.value })}
          />

          <label className="form-label">Puntuación (1–5)</label>
          <input
            type="number"
            min="1"
            max="5"
            className="form-control mb-3"
            value={form.puntuacion}
            onChange={(e) => setForm({ ...form, puntuacion: e.target.value })}
          />

          <label className="form-label">Comentario</label>
          <textarea
            className="form-control mb-3"
            rows="3"
            value={form.comentario}
            onChange={(e) => setForm({ ...form, comentario: e.target.value })}
          />

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate(`/reviews/${id}`)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={updateReview}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
