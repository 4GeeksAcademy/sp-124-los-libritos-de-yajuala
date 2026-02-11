import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function LoginDelivery() {
  const navigate = useNavigate();
  const { actions } = useGlobalReducer();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resp = await fetch(`${backendUrl}/api/delivery/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const text = await resp.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta inválida del servidor");
      }

      if (!resp.ok) {
        throw new Error(data.msg || "Credenciales incorrectas");
      }

      // Guardar token y usuario en store y localStorage
      actions.setToken(data.token);
      actions.setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirigir a zona de repartidores
      navigate("/loggeddelivery");

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Login Repartidor</h1>

      <form className="card p-4 mt-3" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          className="form-control mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          className="form-control mb-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <div className="d-flex">
          <button type="submit" className="btn btn-primary">Entrar</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate("/")}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
