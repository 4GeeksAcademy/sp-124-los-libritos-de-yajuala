import { useState } from "react";

export default function ClienteForm({ cliente, onClose, onUpdated }) {
  const [form, setForm] = useState(cliente);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveCliente = async () => {
    const url = cliente.id
      ? `${import.meta.env.VITE_BACKEND_URL}/api/user/${cliente.id}`
      : `${import.meta.env.VITE_BACKEND_URL}/api/user`;

    const method = cliente.id ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onUpdated();
    onClose();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">
              {cliente.id ? "Editar Cliente" : "Crear Cliente"}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input
                name="lastname"
                className="form-control"
                value={form.lastname}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {!cliente.id && (
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-success" onClick={saveCliente}>
              {cliente.id ? "Guardar Cambios" : "Crear Cliente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
