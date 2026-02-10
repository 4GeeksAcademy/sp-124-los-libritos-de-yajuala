import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";

export const ReviewCreate = () => {
  const navigate = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const { store } = useGlobalReducer();

  const [form, setForm] = useState({
    id_libro: "",
    puntuacion: "",
    comentario: "",
  });

  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/books`);
        if (!res.ok) throw new Error("Error al cargar libros");
        const data = await res.json();
        setLibros(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [backendUrl]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id_libro || !form.puntuacion) {
      alert("Faltan campos obligatorios");
      return;
    }

    const body = {
      id_libro: Number(form.id_libro),
      puntuacion: Number(form.puntuacion),
      comentario: form.comentario || null,
    };

    try {
      const resp = await fetch(`${backendUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await resp.json();
      if (!resp.ok) {
        alert(data.msg || "Error creando review");
        return;
      }

      navigate("/reviews");
    } catch {
      alert("Error de red");
    }
  };

  if (loading) return <p>Cargando libros...</p>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Crear Review</h1>

      <form onSubmit={handleSubmit} className="card p-4">
        <div className="mb-3">
          <label className="form-label">Libro</label>
          <select
            name="id_libro"
            className="form-select"
            value={form.id_libro}
            onChange={handleChange}
            required
          >
            <option value="">-- Selecciona libro --</option>
            {libros.map((l) => (
              <option key={l.id} value={l.id}>
                {l.titulo} ({l.autor})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Puntuación (1–5)</label>
          <input
            type="number"
            name="puntuacion"
            className="form-control"
            min="1"
            max="5"
            value={form.puntuacion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Comentario</label>
          <textarea
            name="comentario"
            className="form-control"
            rows="3"
            value={form.comentario}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success">
            Guardar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/reviews")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
