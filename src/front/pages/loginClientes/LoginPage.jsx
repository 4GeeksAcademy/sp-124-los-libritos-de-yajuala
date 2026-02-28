import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { actions } = useGlobalReducer();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const resp = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.msg || "Credenciales incorrectas");
        return;
      }

      actions.setUser(data.user);
      actions.setToken(data.token);

      switch (data.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;

        case "provider":
          navigate("/provider/me");
          break;

        case "delivery":
          navigate("/loggeddelivery");
          break;

        case "client":
        default:
          navigate("/home-client");
          break;
      }

    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };


  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="cl-login-page">
      <div className="cl-login-card">

        <div className="cl-login-header">
          <div className="cl-login-logo">📚</div>
          <h1 className="cl-login-title">Bienvenido</h1>
          <p className="cl-login-subtitle">Los Libritos de Yajuala</p>
        </div>

        <div className="cl-login-body">
          {error && <div className="cl-alert cl-alert-error">{error}</div>}

          <div className="cl-form-group">
            <label className="cl-label">Email</label>
            <input
              className="cl-input"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyDown={handleKey}
              autoFocus
            />
          </div>

          <div className="cl-form-group">
            <label className="cl-label">Contraseña</label>
            <input
              className="cl-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKey}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              className="cl-btn cl-btn-primary cl-btn-lg"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <button className="cl-btn cl-btn-ghost cl-btn-lg" onClick={() => navigate("/")}>
              Cancelar
            </button>
          </div>
        </div>

        <div className="cl-login-footer">
          ¿No tienes cuenta?{" "}
          <Link to="/clients/create">Regístrate gratis</Link>
        </div>
      </div>
    </div>
  );
}
