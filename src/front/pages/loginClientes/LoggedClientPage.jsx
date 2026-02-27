import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";

export default function LoggedClientPage() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef(null);

  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: store.user?.name || "",
    lastname: store.user?.lastname || "",
    email: store.user?.email || "",
  });

  if (!store.user) { navigate("/login"); return null; }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/user/${store.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.msg || "Error al guardar"); return; }
      dispatch({ type: "set_user", payload: data });
      setMessage("Perfil actualizado correctamente");
      setEditMode(false);
    } catch { setMessage("Error de conexión"); }
    finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch(`${backendUrl}/api/user/${store.user.id}/avatar`, {
        method: "PUT", body: formData,
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.msg || "Error al subir imagen"); return; }
      dispatch({ type: "set_user", payload: data });
      setMessage("Foto de perfil actualizada");
    } catch { setMessage("Error subiendo imagen"); }
    finally { setUploading(false); }
  };

  const acciones = [
    { icon: "🛒", label: "Mi carrito", to: "/user/cart" },
    { icon: "📦", label: "Mis pedidos", to: "/user/history" },
    { icon: "📚", label: "Ver libros", to: "/home-client" },
    { icon: "⭐", label: "Mis reseñas", to: "/reviews" },
    { icon: "💘", label: "Mis matches", to: "/swipe" },
    { icon: "📍", label: "Direcciones", to: "/addresses" },
  ];

  return (
    <div className="cl-page cl-page-mid">

      {/* Hero del perfil */}
      <div className="cl-profile-hero">
        <div className="cl-profile-avatar-wrap">
          <img
            className="cl-profile-avatar"
            src={store.user.avatar_url || `https://ui-avatars.com/api/?name=${store.user.name}+${store.user.lastname}&background=1d3557&color=fff&size=120`}
            alt="Avatar"
          />
          <button
            className="cl-profile-avatar-btn"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            title="Cambiar foto"
          >
            {uploading ? "⏳" : "📷"}
          </button>
          <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>
        <div>
          <h2 className="cl-profile-name">{store.user.name} {store.user.lastname}</h2>
          <p className="cl-profile-email">{store.user.email}</p>
          <span className="cl-profile-badge">Cliente</span>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="cl-profile-actions">
        {acciones.map((a) => (
          <button key={a.to} className="cl-profile-action-btn" onClick={() => navigate(a.to)}>
            <span className="cl-action-icon">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      {/* Mensaje feedback */}
      {message && (
        <div className={`cl-alert ${message.includes("Error") ? "cl-alert-error" : "cl-alert-success"}`}>
          {message}
        </div>
      )}

      {/* Card de datos del perfil */}
      <div className="cl-card">
        <div className="cl-card-header">
          <span className="cl-card-header-title">Datos del perfil</span>
          <button
            className="cl-btn cl-btn-ghost cl-btn-sm"
            onClick={() => {
              setEditMode(!editMode);
              setMessage("");
              setForm({ name: store.user.name, lastname: store.user.lastname, email: store.user.email });
            }}
          >
            {editMode ? "Cancelar" : "✏️ Editar"}
          </button>
        </div>
        <div className="cl-card-body">
          {editMode ? (
            <>
              <div className="cl-form-group">
                <label className="cl-label">Nombre</label>
                <input className="cl-input" name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="cl-form-group">
                <label className="cl-label">Apellido</label>
                <input className="cl-input" name="lastname" value={form.lastname} onChange={handleChange} />
              </div>
              <div className="cl-form-group">
                <label className="cl-label">Email</label>
                <input className="cl-input" type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
              <button className="cl-btn cl-btn-success" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[["Nombre", store.user.name], ["Apellido", store.user.lastname], ["Email", store.user.email]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", gap: "12px", fontSize: "14px" }}>
                  <span style={{ color: "var(--cl-text-muted)", minWidth: "80px", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", paddingTop: "2px" }}>{label}</span>
                  <span style={{ color: "var(--cl-text)" }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
