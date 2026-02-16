import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDeliveryCreate() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    identificacion: "",
    password: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const resp = await fetch(`${backendUrl}/api/delivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (resp.ok) navigate("/admin/delivery");
  };

  return (
    <div>
      <h1>Crear Repartidor</h1>

      <form className="col-6" onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="nombre" placeholder="Nombre" onChange={handleChange} />
        <input className="form-control mb-2" name="apellido" placeholder="Apellido" onChange={handleChange} />
        <input className="form-control mb-2" name="email" placeholder="Email" onChange={handleChange} />
        <input className="form-control mb-2" name="identificacion" placeholder="Identificación" onChange={handleChange} />
        <input className="form-control mb-2" name="password" placeholder="Contraseña" onChange={handleChange} />

        <button className="btn btn-success">Crear</button>
      </form>
    </div>
  );
}
