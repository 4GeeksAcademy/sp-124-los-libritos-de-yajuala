import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function LoginPage() {
  const navigate = useNavigate();
  const { store, actions } = useGlobalReducer();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async () => {
    const resp = await fetch(`${backendUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await resp.json();


    if (!resp.ok) {
      alert(data.msg || "Credenciales incorrectas");
      return;
    }

    actions.setUser(data.user);
    actions.setToken(data.token);


    navigate("/home-client");
  };

  return (
    <div className="container mt-5">
      <h1>Iniciar sesión</h1>

      <div className="card p-4 mt-3">
        <label>Email</label>
        <input
          className="form-control mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label>Contraseña</label>
        <input
          type="password"
          className="form-control mb-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="d-flex">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Entrar
          </button>
          <button
            className="btn btn-secondary ms-2"
            onClick={() => navigate("/")}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
