import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";

export const ReviewCreate = () => {
  const navigate = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const { store } = useGlobalReducer();

  const [form, setForm] = useState({ id_libro: "", puntuacion: 0, comentario: "" });
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    fetch(`${backendUrl}/api/books`)
      .then((r) => r.json())
      .then((data) => setLibros(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_libro || !form.puntuacion) {
      alert("Selecciona libro y puntuación");
      return;
    }
    setSaving(true);
    try {
      const resp = await fetch(`${backendUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({
          id_libro: Number(form.id_libro),
          puntuacion: Number(form.puntuacion),
          comentario: form.comentario || null,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert(data.msg || "Error creando reseña");
        return;
      }
      navigate("/reviews");
    } catch {
      alert("Error de red");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Cargando libros…</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      
      <div className="mb-3">
        <small className="text-muted" style={{ cursor: "pointer" }} onClick={() => navigate("/reviews")}>
          Reseñas
        </small>
        <small className="text-muted mx-1">›</small>
        <small className="text-muted">Nueva reseña</small>
      </div>

      <h1 className="fw-bold">Escribir reseña</h1>
      <p className="text-muted mb-4">Comparte tu opinión con otros lectores</p>

      <div className="card shadow-sm">
        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label fw-semibold">Libro</label>
              <select
                className="form-select"
                value={form.id_libro}
                onChange={(e) => setForm({ ...form, id_libro: e.target.value })}
                required
              >
                <option value="">— Selecciona un libro —</option>
                {libros.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titulo} · {l.autor}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Puntuación</label>
              <div className="d-flex align-items-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={`btn p-0 border-0 fs-3 ${
                      i <= (hover || form.puntuacion) ? "text-warning" : "text-secondary"
                    }`}
                    style={{ background: "none" }}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setForm({ ...form, puntuacion: i })}
                  >
                    ★
                  </button>
                ))}

                {form.puntuacion > 0 && (
                  <span className="text-muted ms-2">{form.puntuacion}/5</span>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Comentario <span className="text-muted">(opcional)</span>
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="¿Qué te ha parecido el libro?"
                value={form.comentario}
                onChange={(e) => setForm({ ...form, comentario: e.target.value })}
              />
            </div>

            <div className="d-flex gap-3 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Publicando..." : "Publicar reseña"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/reviews")}
              >
                Cancelar
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
