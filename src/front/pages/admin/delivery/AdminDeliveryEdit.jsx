import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminDeliveryEdit() {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/delivery/${id}`)
      .then(res => res.json())
      .then(data => setForm(data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    await fetch(`${backendUrl}/api/delivery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    navigate("/admin/delivery");
  };

  if (!form) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Editar Repartidor</h1>

      <form className="col-6" onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="nombre" value={form.nombre} onChange={handleChange} />
        <input className="form-control mb-2" name="apellido" value={form.apellido} onChange={handleChange} />
        <input className="form-control mb-2" name="email" value={form.email} onChange={handleChange} />
        <input className="form-control mb-2" name="identificacion" value={form.identificacion} onChange={handleChange} />

        <button className="btn btn-warning">Guardar Cambios</button>
      </form>
    </div>
  );
}
