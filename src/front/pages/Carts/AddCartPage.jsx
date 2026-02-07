import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function AddCartPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id_cliente: "",
    estado: "pendiente"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveCart = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_cliente: form.id_cliente,
        estado: form.estado
      })
    });

    navigate("/carts");
  };


  return (
    <div className="container mt-4">
      <h1>Crear Carrito</h1>

      <div className="card p-4 shadow mt-3">
        <div className="mb-3">
          <label className="form-label">ID Cliente</label>
          <input
            name="id_cliente"
            className="form-control"
            value={form.id_cliente}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select
            name="estado"
            className="form-control"
            value={form.estado}
            onChange={handleChange}
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="d-flex">
          <button className="btn btn-success" onClick={saveCart}>
            Crear Carrito
          </button>

          <button className="btn btn-secondary ms-2" onClick={() => navigate("/carts")}>
            Cancelar
          </button>
        </div></div>
    </div>
  );
}
