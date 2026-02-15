import { useState } from "react";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function CreateAddressPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
    telefono: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!store.user?.id) {
      alert("Usuario no cargado. Vuelve a iniciar sesión.");
      return;
    }

    try {
      const resp = await fetch(`${backendUrl}/api/users/${store.user.id}/addresses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        alert(data?.msg || "Error guardando dirección");
        return;
      }

      navigate("/addresses");
    } catch (err) {
      console.error(err);
      alert("Error de red guardando dirección");
    }
  };

  return (
    <div className="container mt-4">
      <h1>Añadir dirección</h1>

      <input className="form-control mt-3" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
      <input className="form-control mt-3" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} />
      <input className="form-control mt-3" name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={handleChange} />
      <input className="form-control mt-3" name="provincia" placeholder="Provincia" value={form.provincia} onChange={handleChange} />
      <input className="form-control mt-3" name="codigo_postal" placeholder="Código postal" value={form.codigo_postal} onChange={handleChange} />
      <input className="form-control mt-3" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />

      <button className="btn btn-success mt-4" onClick={handleSubmit}>
        Guardar
      </button>
    </div>
  );
}
