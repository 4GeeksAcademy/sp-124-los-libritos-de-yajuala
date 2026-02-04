import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddNewClient() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveCliente = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      navigate("/clients");
    }
  };

  return (
    <div className="container mt-4">
      <h1>Crear Cliente</h1>

      <div className="card p-4 shadow mt-3">
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            name="name"
            className="form-control"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Apellido</label>
          <input
            name="lastname"
            className="form-control"
            value={form.lastname}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            name="password"
            type="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
          />
        </div>
        <div className="d-flex">
          <button className="btn btn-success mb-0" onClick={saveCliente}>
            Crear Cliente
          </button>

          <button className="btn btn-secondary ms-2" onClick={() => navigate("/clients")}>
            Cancelar
          </button>
        </div></div>
    </div>
  );
}
