import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import "../../../styles/client.css";

export default function CreateAddressPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [form, setForm] = useState({
    nombre: "", direccion: "", ciudad: "",
    provincia: "", codigo_postal: "", telefono: "",
    latitud: null, longitud: null,
  });
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (window.google?.maps) { initMap(40.4168, -3.7038); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap(40.4168, -3.7038);
    document.head.appendChild(script);
  }, []);

  const initMap = (lat, lng) => {
    if (!mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, { center: { lat, lng }, zoom: 15 });
    const marker = new window.google.maps.Marker({ position: { lat, lng }, map });
    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  const updateMap = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    const pos = { lat, lng };
    mapInstanceRef.current.setCenter(pos);
    markerRef.current.setPosition(pos);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBlur = async () => {
    if (!form.direccion || !form.ciudad) return;
    setGeocoding(true);
    const fullAddress = `${form.direccion}, ${form.ciudad}, ${form.provincia}, ${form.codigo_postal}`;
    try {
      const res = await fetch(`${backendUrl}/api/geocode?address=${encodeURIComponent(fullAddress)}`);
      const data = await res.json();
      if (!res.ok) return;
      setForm((prev) => ({ ...prev, latitud: data.lat, longitud: data.lng }));
      if (mapInstanceRef.current) updateMap(data.lat, data.lng);
      else initMap(data.lat, data.lng);
    } catch (err) { console.error(err); }
    finally { setGeocoding(false); }
  };

  const handleSubmit = async () => {
    if (!store.user?.id) { alert("Usuario no cargado. Vuelve a iniciar sesión."); return; }
    setSaving(true);
    let payload = { ...form };

    if (payload.latitud == null || payload.longitud == null) {
      if (!payload.direccion || !payload.ciudad) { alert("Completa al menos dirección y ciudad."); setSaving(false); return; }
      const fullAddress = `${payload.direccion}, ${payload.ciudad}, ${payload.provincia}, ${payload.codigo_postal}`;
      try {
        const res = await fetch(`${backendUrl}/api/geocode?address=${encodeURIComponent(fullAddress)}`);
        const data = await res.json();
        if (!res.ok) { alert("No se pudo obtener coordenadas."); setSaving(false); return; }
        payload.latitud = data.lat;
        payload.longitud = data.lng;
      } catch { alert("Error geocodificando."); setSaving(false); return; }
    }

    try {
      const resp = await fetch(`${backendUrl}/api/users/${store.user.id}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) { alert(data?.msg || "Error guardando dirección"); return; }
      navigate("/addresses");
    } catch { alert("Error de red"); }
    finally { setSaving(false); }
  };

  const fields = [
    { name: "nombre", placeholder: "Nombre de la dirección (ej: Casa, Trabajo)", blur: false },
    { name: "direccion", placeholder: "Calle y número", blur: true },
    { name: "ciudad", placeholder: "Ciudad", blur: true },
    { name: "provincia", placeholder: "Provincia", blur: true },
    { name: "codigo_postal", placeholder: "Código postal", blur: true },
    { name: "telefono", placeholder: "Teléfono de contacto (opcional)", blur: false },
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
            <span>Nueva</span>
          </div>
          <h1 className="cl-title">Añadir dirección</h1>
          <p className="cl-subtitle">La dirección se localizará automáticamente en el mapa</p>
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
                style={{ gridColumn: f.name === "nombre" || f.name === "direccion" || f.name === "telefono" ? "1 / -1" : "auto", marginBottom: 0 }}
              >
                <label className="cl-label">{f.placeholder.split(" (")[0]}</label>
                <input
                  className="cl-input"
                  name={f.name}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  onBlur={f.blur ? handleBlur : undefined}
                />
              </div>
            ))}
          </div>

          {/* Mapa */}
          <div style={{ marginTop: "24px" }}>
            <label className="cl-label">
              Ubicación en el mapa
              {geocoding && <span style={{ color: "var(--cl-text-muted)", fontWeight: 400, marginLeft: "8px" }}>Localizando...</span>}
            </label>
            <div
              ref={mapRef}
              style={{ width: "100%", height: "280px", borderRadius: "var(--cl-radius-sm)", border: "1.5px solid var(--cl-border)", marginTop: "6px" }}
            />
            {form.latitud && (
              <p style={{ fontSize: "11px", color: "var(--cl-text-muted)", marginTop: "6px" }}>
                📍 {form.latitud.toFixed(5)}, {form.longitud.toFixed(5)}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
            <button className="cl-btn cl-btn-accent cl-btn-lg" onClick={handleSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar dirección"}
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
