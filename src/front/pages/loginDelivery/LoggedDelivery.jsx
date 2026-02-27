import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function LoggedDelivery() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!store.token) {
      navigate("/login/delivery");
      return;
    }
    if (store.user && store.user.role !== "delivery") {
      navigate("/login/delivery");
    }
  }, [store.token, store.user]);

  if (!store.token || !store.user) return <div>Cargando...</div>;

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(`${backendUrl}/api/delivery/${store.user.id}/avatar`, {
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
      <h2 className="mb-4">Perfil del Repartidor</h2>

      <div className="d-flex align-items-center gap-4 mb-4">
        <div style={{ position: "relative" }}>
          <img
            src={
              store.user.avatar_url ||
              `https://ui-avatars.com/api/?name=${store.user.name}&background=2563eb&color=fff&size=120`
            }
            alt="Avatar"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #1d4ed8",
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
              fontSize: "18px",
            }}
            onClick={() => fileInputRef.current.click()}
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
          <h3 className="mb-0">{store.user.name}</h3>
          <p className="text-muted mb-0">{store.user.email}</p>
          <span className="badge bg-primary">{store.user.role}</span>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${
            message.includes("Error") ? "alert-danger" : "alert-success"
          } py-2`}
        >
          {message}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Datos del perfil</span>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => navigate(`/delivery/${store.user.id}/edit`)}
          >
            ✏️ Editar perfil
          </button>
        </div>

        <div className="card-body">
          <p><strong>Nombre:</strong> {store.user.name}</p>
          <p><strong>Email:</strong> {store.user.email}</p>
          <p><strong>Teléfono:</strong> {store.user.telefono || "—"}</p>
          <p className="mb-0"><strong>Documento:</strong> {store.user.documento}</p>
        </div>
      </div>

      
    </div>
  );
}
