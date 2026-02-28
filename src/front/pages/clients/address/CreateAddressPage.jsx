import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import "../../../styles/client.css";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    <div className="container-fluid py-4">
      <nav className="breadcrumb mb-3">
        <span className="breadcrumb-item" style={{ cursor: "pointer" }} onClick={() => navigate("/user")}>
          Mi cuenta
        </span>
        <span className="breadcrumb-item" style={{ cursor: "pointer" }} onClick={() => navigate("/addresses")}>
          Direcciones
        </span>
        <span className="breadcrumb-item active">Nueva</span>
      </nav>
      <h1 className="h3 mb-1">Añadir dirección</h1>
      <p className="text-muted mb-4">La dirección se localizará automáticamente en el mapa</p>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3">

            {fields.map((f) => (
              <div
                key={f.name}
                className={`col-12 ${["ciudad", "provincia", "codigo_postal"].includes(f.name) ? "col-md-6" : ""}`}
              >
                <label className="form-label">{f.placeholder.split(" (")[0]}</label>
                <input
                  className="form-control"
                  name={f.name}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  onBlur={f.blur ? handleBlur : undefined}
                />
              </div>
            ))}

          </div>
          <div className="mt-4">
            <label className="form-label">
              Ubicación en el mapa
              {geocoding && (
                <span className="text-muted ms-2">Localizando…</span>
              )}
            </label>

            <div
              ref={mapRef}
              className="rounded border"
              style={{ width: "100%", height: "300px" }}
            />

            {form.latitud && (
              <p className="text-muted small mt-2">
                <FontAwesomeIcon icon={faLocationDot} /> {form.latitud.toFixed(5)}, {form.longitud.toFixed(5)}
              </p>
            )}
          </div>
          <div className="d-flex gap-3 mt-4">
            <button
              className="btn btn-success btn-lg"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar dirección"}
            </button>

            <button
              className="btn btn-outline-secondary btn-lg"
              onClick={() => navigate("/addresses")}
            >
              Cancelar
            </button>
          </div>

        </div>
      </div>

    </div>
  );

}
