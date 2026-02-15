import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const DeliveryCreate = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    identificacion: "",
  });
  const navigate = useNavigate();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const createDelivery = async () => {
    try {
      if (!form.nombre || !form.apellido || !form.email || !form.password || !form.identificacion) {
        alert("Completa nombre, apellido, email, password e identificacion");
        return;
      }

      const resp = await fetch(`${backendUrl}/api/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error creando repartidor (${resp.status})`);
        return;
      }

      setForm({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        identificacion: "",
      });
      navigate("/logindelivery");
    } catch (error) {
      alert("Error de red");
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Crear Repartidor</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/delivery")}>
          Volver
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <label className="form-label">Nombre</label>
          <input
            className="form-control mb-3"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <label className="form-label">Apellido</label>
          <input
            className="form-control mb-3"
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          />

          <label className="form-label">Email</label>
          <input
            className="form-control mb-3"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control mb-3"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <label className="form-label">Identificación</label>
          <input
            className="form-control mb-3"
            value={form.identificacion}
            onChange={(e) => setForm({ ...form, identificacion: e.target.value })}
          />

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate("/delivery")}>
              Cancelar
            </button>
            <button className="btn btn-success" onClick={createDelivery}>
              Crear Repartidor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
