import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { faCamera, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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


  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-4 mb-4 p-4 bg-light rounded shadow-sm">
        <div className="position-relative">
          <img
            src={
              store.user.avatar_url ||
              `https://ui-avatars.com/api/?name=${store.user.name}+${store.user.lastname}&background=1d3557&color=fff&size=120`
            }
            className="rounded-circle border"
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />

          <button
            className="btn btn-sm btn-primary position-absolute bottom-0 end-0"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? <FontAwesomeIcon icon={faHourglassHalf} /> : <FontAwesomeIcon icon={faCamera} />}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="d-none"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <h2 className="fw-bold mb-1">
            {store.user.name} {store.user.lastname}
          </h2>
          <p className="text-muted mb-1">{store.user.email}</p>
          <span className="badge bg-primary">Cliente</span>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${message.includes("Error") ? "alert-danger" : "alert-success"
            }`}
        >
          {message}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Datos del perfil</h5>

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
            {editMode ? "Cancelar" : "✏️ Editar"}
          </button>
        </div>

        <div className="card-body">
          {editMode ? (
            <>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Apellido</label>
                <input
                  className="form-control"
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
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
            <div className="d-flex flex-column gap-2">
              <div><strong>Nombre:</strong> {store.user.name}</div>
              <div><strong>Apellido:</strong> {store.user.lastname}</div>
              <div><strong>Email:</strong> {store.user.email}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
