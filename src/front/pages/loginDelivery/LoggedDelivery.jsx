import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Delivery } from "../Delivery/DeliveryList";

export default function LoggedDelivery() {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    identificacion: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !storedUser?.id) {
      navigate("/logindelivery");
      return;
    }

    if (storedUser.role !== "delivery") {
      navigate("/");
      return;
    }

    setUser(storedUser);
    setForm({
      name: storedUser.name || "",
      lastname: storedUser.lastname || "",
      email: storedUser.email || "",
      identificacion: storedUser.identificacion || "",
    });
    setLoading(false);
  }, [navigate]);

  if (loading) return <p>Cargando...</p>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/delivery/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.msg || "Error al guardar");
        return;
      }
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
      const res = await fetch(`${backendUrl}/api/delivery/${user.id}/avatar`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.msg || "Error al subir imagen");
        return;
      }
      const updatedUser = { ...user, avatar_url: data.avatar_url };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}+${user.lastname}&background=0d6efd&color=fff&size=120`}
            alt="Avatar"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #0d6efd"
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
          <h2 className="mb-0">{user.name} {user.lastname}</h2>
          <p className="text-muted mb-0">{user.email}</p>
          <span className="badge bg-primary">{user.role}</span>
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
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                identificacion: user.identificacion,
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
                <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Apellido</label>
                <input type="text" className="form-control" name="lastname" value={form.lastname} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Identificación</label>
                <input type="text" className="form-control" name="identificacion" value={form.identificacion} onChange={handleChange} />
              </div>
              <button className="btn btn-success" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          ) : (
            <>
              <p><strong>Nombre:</strong> {user.name}</p>
              <p><strong>Apellido:</strong> {user.lastname}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p className="mb-0"><strong>Identificación:</strong> {user.identificacion}</p>
            </>
          )}
        </div>
      </div>

      
      <div className="card">
        <div className="card-header">
          <span>🚴‍♂️ Pedidos asignados</span>
        </div>
        <div className="card-body">
          <Delivery />
        </div>
      </div>
    </div>
  );
}
