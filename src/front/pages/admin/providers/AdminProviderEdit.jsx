import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminProviderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/provider/${id}`)
      .then(res => res.json())
      .then(data => setForm(data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const resp = await fetch(`${backendUrl}/api/provider/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (resp.ok) navigate("/admin/providers");
    else alert("Error editando proveedor");
  };

  if (!form) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Editar Proveedor</h1>

      <form onSubmit={handleSubmit} className="col-6">
        <input className="form-control mb-2" name="nombre" value={form.nombre} onChange={handleChange} />
        <input className="form-control mb-2" name="email" value={form.email} onChange={handleChange} />
        <input className="form-control mb-2" name="telefono" value={form.telefono} onChange={handleChange} />
        <input className="form-control mb-2" name="documento" value={form.documento} onChange={handleChange} />

        <button className="btn btn-warning">Guardar cambios</button>
      </form>
    </div>
  );
}
