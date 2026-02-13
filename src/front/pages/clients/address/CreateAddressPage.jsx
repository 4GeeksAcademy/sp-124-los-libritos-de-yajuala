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
    await fetch(`${backendUrl}/api/users/${store.user.id}/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    navigate("/addresses");
  };

  return (
    <div className="container mt-4">
      <h1>Añadir dirección</h1>

      <input className="form-control mt-3" name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input className="form-control mt-3" name="direccion" placeholder="Dirección" onChange={handleChange} />
      <input className="form-control mt-3" name="ciudad" placeholder="Ciudad" onChange={handleChange} />
      <input className="form-control mt-3" name="provincia" placeholder="Provincia" onChange={handleChange} />
      <input className="form-control mt-3" name="codigo_postal" placeholder="Código postal" onChange={handleChange} />
      <input className="form-control mt-3" name="telefono" placeholder="Teléfono" onChange={handleChange} />

      <button className="btn btn-success mt-4" onClick={handleSubmit}>
        Guardar
      </button>
    </div>
  );
}
