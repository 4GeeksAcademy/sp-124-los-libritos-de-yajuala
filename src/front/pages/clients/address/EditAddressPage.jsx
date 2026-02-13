import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";

export default function EditAddressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/addresses/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    await fetch(`${backendUrl}/api/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    navigate("/addresses");
  };

  if (!form) return <p>Cargando...</p>;

  return (
    <div className="container mt-4">
      <h1>Editar dirección</h1>

      <input className="form-control mt-3" name="nombre" value={form.nombre} onChange={handleChange} />
      <input className="form-control mt-3" name="direccion" value={form.direccion} onChange={handleChange} />
      <input className="form-control mt-3" name="ciudad" value={form.ciudad} onChange={handleChange} />
      <input className="form-control mt-3" name="provincia" value={form.provincia} onChange={handleChange} />
      <input className="form-control mt-3" name="codigo_postal" value={form.codigo_postal} onChange={handleChange} />
      <input className="form-control mt-3" name="telefono" value={form.telefono} onChange={handleChange} />

      <button className="btn btn-success mt-4" onClick={handleSubmit}>
        Guardar cambios
      </button>
    </div>
  );
}
