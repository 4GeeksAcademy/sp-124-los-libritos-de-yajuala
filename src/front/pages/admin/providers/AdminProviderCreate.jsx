import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminProviderCreate() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    documento: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const resp = await fetch(`${backendUrl}/api/provider`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (resp.ok) navigate("/admin/providers");
    else alert("Error creando proveedor");
  };

  return (
    <div>
      <h1>Crear Proveedor</h1>

      <form onSubmit={handleSubmit} className="col-6">
        <input className="form-control mb-2" name="nombre" placeholder="Nombre" onChange={handleChange} />
        <input className="form-control mb-2" name="email" placeholder="Email" onChange={handleChange} />
        <input className="form-control mb-2" name="telefono" placeholder="Teléfono" onChange={handleChange} />
        <input className="form-control mb-2" name="password" placeholder="Contraseña" onChange={handleChange} />
        <input className="form-control mb-2" name="documento" placeholder="Documento" onChange={handleChange} />

        <button className="btn btn-success">Crear</button>
      </form>
    </div>
  );
}
