import React, { useState } from "react";
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


  return (
    <div className="container mt-5">
      <h1 className="mb-4">Crear Review</h1>

      <form onSubmit={handleSubmit} className="card p-4">

        {!user && (
          <div className="mb-3">
            <label className="form-label">ID Cliente</label>
            <input
              type="number"
              name="id_cliente"
              className="form-control"
              value={form.id_cliente}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">ID Libro</label>
          <input
            type="number"
            name="id_libro"
            className="form-control"
            value={form.id_libro}
            onChange={handleChange}
            required
          />
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
