import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminCategoryCreate() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    nombre: "",
    descripcion: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const resp = await fetch(`${backendUrl}/api/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (resp.ok) {
      navigate("/admin/categories");
    } else {
      const error = await resp.json().catch(() => null);
      alert(error?.msg || "Error creando categoría");
    }
  };

  return (
    <div>
      <h1>Crear Categoría</h1>

      <form onSubmit={handleSubmit} className="col-6">

        <label className="form-label">Nombre</label>
        <input
          className="form-control mb-3"
          name="nombre"
          placeholder="Nombre"
          onChange={handleChange}
          required
        />

        <label className="form-label">Descripción</label>
        <textarea
          className="form-control mb-3"
          name="descripcion"
          placeholder="Descripción"
          onChange={handleChange}
          required
        ></textarea>

        <button className="btn btn-success">Crear</button>
      </form>
    </div>
  );
}
