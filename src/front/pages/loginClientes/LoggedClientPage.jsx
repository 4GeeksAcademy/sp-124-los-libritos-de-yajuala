import { useState, useRef } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

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

  if (!store.user) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/user/${store.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.msg || "Error al guardar");
        return;
      }
      dispatch({ type: "set_user", payload: data });
      setMessage("Perfil actualizado correctamente");
      setEditMode(false);
    } catch (err) {
      setMessage("Error de conexión");
    } finally {
      setSaving(false);
    }
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
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.msg || "Error al subir imagen");
        return;
      }
      dispatch({ type: "set_user", payload: data });
      setMessage("Foto de perfil actualizada");
    } catch (err) {
      setMessage("Error subiendo imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "700px" }}>

      
      <div className="d-flex align-items-center gap-4 mb-4">
        <div style={{ position: "relative" }}>
          <img
            src={store.user.avatar_url || "https://ui-avatars.com/api/?name=" + store.user.name + "+" + store.user.lastname + "&background=198754&color=fff&size=120"}
            alt="Avatar"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #198754"
            }}
          />
          <button
            className="btn btn-sm btn-dark"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              padding: 0,
              fontSize: "18px"
            }}
            onClick={() => fileInputRef.current.click()}
            title="Cambiar foto"
            disabled={uploading}
          >
            {uploading ? "..." : "📷"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <h2 className="mb-0">{store.user.name} {store.user.lastname}</h2>
          <p className="text-muted mb-0">{store.user.email}</p>
          <span className="badge bg-success">{store.user.role}</span>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes("Error") ? "alert-danger" : "alert-success"} py-2`}>
          {message}
        </div>
      )}

      
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Datos del perfil</span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setEditMode(!editMode);
              setMessage("");
              setForm({
                name: store.user.name,
                lastname: store.user.lastname,
                email: store.user.email,
              });
            }}
          >
            {editMode ? "Cancelar" : "✏️ Editar perfil"}
          </button>
        </div>
        <div className="card-body">
          {editMode ? (
            <>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <button
                className="btn btn-success"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          ) : (
            <>
              <p><strong>Nombre:</strong> {store.user.name}</p>
              <p><strong>Apellido:</strong> {store.user.lastname}</p>
              <p className="mb-0"><strong>Email:</strong> {store.user.email}</p>
            </>
          )}
        </div>
      </div>

      
      <div className="d-flex flex-wrap gap-3">
        <button className="btn btn-success" onClick={() => navigate("/user/history")}>
          Ver historial de pedidos
        </button>
        <button className="btn btn-primary" onClick={() => navigate("/reviews/new")}>
          Crear review
        </button>
        <button className="btn btn-warning" onClick={() => navigate("/home-client")}>
          Ver libros
        </button>
        <button className="btn btn-primary" onClick={() => navigate("/swipe")}>
          Mis matches
        </button>
        <button className="btn btn-success" onClick={() => navigate("/user/cart")}>
          Ver carrito
        </button>

        <button
          className="btn btn-info"
          onClick={() => navigate("/user/favorite-categories")}
        >
          Categorías favoritas
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/home-client")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}