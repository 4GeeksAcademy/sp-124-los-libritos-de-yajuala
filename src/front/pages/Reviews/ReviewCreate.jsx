import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";

export const ReviewCreate = () => {
  const navigate = useNavigate();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const { store } = useGlobalReducer();
  const user = store.user;

  const [form, setForm] = useState({
    id_libro: "",
    puntuacion: "",
    comentario: "",
    id_cliente: ""
  });

  const [clientes, setClientes] = useState([]);
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar clientes y libros disponibles (selector)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, booksRes] = await Promise.all([
          fetch(backendUrl + "/api/clients"),
          fetch(backendUrl + "/api/books"),
        ]);

        if (!clientsRes.ok) throw new Error("Error al cargar clientes");
        if (!booksRes.ok) throw new Error("Error al cargar libros");

        const clientsData = await clientsRes.json();
        const booksData = await booksRes.json();

        setClientes(clientsData);
        setLibros(booksData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

  if (!user) {
    if (!form.id_cliente) {
      alert("Debes indicar el ID del cliente");
      return;
    }
    body.id_cliente = Number(form.id_cliente);
  }

  try {

  const resp = await fetch(backendUrl + "/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${store.token}`
    },
    body: JSON.stringify(body),
  });


    const data = await resp.json();

    if (!resp.ok) {
      alert(data.msg || "Error creando review");
      return;
    }

      navigate("/reviews");
    } catch (error) {
      alert("Error de red");
    }
  };

  if (loading) return <p>Cargando clientes y libros...</p>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Crear Review</h1>

      <form onSubmit={handleSubmit} className="card p-4">
        <div className="mb-3">
          <label className="form-label">Cliente</label>
          <select
            name="id_cliente"
            className="form-select"
            value={form.id_cliente}
            onChange={handleChange}
            required
          >
            <option value="">-- Selecciona cliente --</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre || c.email}
              </option>
            ))}
          </select>
        </div>

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
