import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditCartPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id_cliente: "",
    monto_total: 0,
    estado: "pendiente"
  });

  const fetchCart = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/${id}`);
    const data = await res.json();
    setForm(data);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateCart = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    navigate("/carts");
  };

  return (
    <div className="container mt-4">
      <h1>Editar Carrito</h1>

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
          <label className="form-label">Monto Total</label>
          <input
            name="monto_total"
            type="number"
            className="form-control"
            value={form.monto_total}
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
          <button className="btn btn-primary" onClick={updateCart}>
            Guardar Cambios
          </button>

          <button className="btn btn-secondary ms-2" onClick={() => navigate("/carts")}>
            Cancelar
          </button>
        </div></div>
    </div>
  );
}
