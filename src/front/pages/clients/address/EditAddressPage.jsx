import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import "../../../styles/client.css";

export default function EditAddressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Carga la dirección y geocodifica si faltan coordenadas
  useEffect(() => {
    fetch(`${backendUrl}/api/addresses/${id}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (!data.latitud || !data.longitud) {
          const fullAddress = `${data.direccion}, ${data.ciudad}, ${data.provincia}`;
          const res = await fetch(`${backendUrl}/api/geocode?address=${encodeURIComponent(fullAddress)}`);
          const geo = await res.json();
          if (res.ok) { data.latitud = geo.lat; data.longitud = geo.lng; }
        }
        setForm(data);
      });
  }, []);

  // Inicializa el mapa cuando el formulario está listo
  useEffect(() => {
    if (!form) return;
    const lat = form.latitud || 40.4168;
    const lng = form.longitud || -3.7038;

    if (window.google?.maps) { initMap(lat, lng); return; }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap(lat, lng);
    document.head.appendChild(script);
  }, [form?.id]);

  const initMap = (lat, lng) => {
    if (!mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, { center: { lat, lng }, zoom: 15 });
    const marker = new window.google.maps.Marker({ position: { lat, lng }, map, draggable: true });
    marker.addListener("dragend", (e) => {
      setForm((prev) => ({ ...prev, latitud: e.latLng.lat(), longitud: e.latLng.lng() }));
    });
    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await fetch(`${backendUrl}/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      navigate("/addresses");
    } catch { alert("Error de red"); }
    finally { setSaving(false); }
  };

  if (!form) return <div className="cl-page"><div className="cl-loader">Cargando dirección</div></div>;

  const fields = [
    { name: "nombre", label: "Nombre" },
    { name: "direccion", label: "Dirección" },
    { name: "ciudad", label: "Ciudad" },
    { name: "provincia", label: "Provincia" },
    { name: "codigo_postal", label: "Código postal" },
    { name: "telefono", label: "Teléfono" },
  ];

  return (
    <div className="cl-page cl-page-narrow">

      {/* Cabecera */}
      <div className="cl-page-header">
        <div className="cl-page-header-left">
          <div className="cl-breadcrumb">
            <span onClick={() => navigate("/user")} style={{ cursor: "pointer" }}>Mi cuenta</span>
            <span>›</span>
            <span onClick={() => navigate("/addresses")} style={{ cursor: "pointer" }}>Direcciones</span>
            <span>›</span>
            <span>Editar</span>
          </div>
          <h1 className="cl-title">Editar dirección</h1>
          <p className="cl-subtitle">Puedes arrastrar el marcador para ajustar la ubicación exacta</p>
        </div>
      </div>

      <div className="cl-card">
        <div className="cl-card-body">

          {/* Formulario */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {fields.map((f) => (
              <div
                key={f.name}
                className="cl-form-group"
                style={{
                  gridColumn: f.name === "nombre" || f.name === "direccion" || f.name === "telefono" ? "1 / -1" : "auto",
                  marginBottom: 0,
                }}
              >
                <label className="cl-label">{f.label}</label>
                <input
                  className="cl-input"
                  name={f.name}
                  value={form[f.name] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          {/* Mapa */}
          <div style={{ marginTop: "24px" }}>
            <label className="cl-label">
              Ubicación en el mapa
              <span style={{ color: "var(--cl-text-muted)", fontWeight: 400, marginLeft: "8px", textTransform: "none", letterSpacing: 0 }}>
                (arrastra el marcador para ajustar)
              </span>
            </label>
            <div
              ref={mapRef}
              style={{ width: "100%", height: "280px", borderRadius: "var(--cl-radius-sm)", border: "1.5px solid var(--cl-border)", marginTop: "6px" }}
            />
            {form.latitud && (
              <p style={{ fontSize: "11px", color: "var(--cl-text-muted)", marginTop: "6px" }}>
                📍 {Number(form.latitud).toFixed(5)}, {Number(form.longitud).toFixed(5)}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
            <button className="cl-btn cl-btn-accent cl-btn-lg" onClick={handleSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button className="cl-btn cl-btn-ghost cl-btn-lg" onClick={() => navigate("/addresses")}>
              Cancelar
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
