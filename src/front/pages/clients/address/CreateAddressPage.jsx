import { useState, useEffect, useRef } from "react";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function CreateAddressPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigo_postal: "",
    telefono: "",
    latitud: null,
    longitud: null
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  
  useEffect(() => {
    if (window.google?.maps) {
      initMap(40.4168, -3.7038);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap(40.4168, -3.7038);
    document.head.appendChild(script);
  }, []);

  const initMap = (lat, lng) => {
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15
    });

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  const updateMap = (lat, lng) => {
    if (!mapInstanceRef.current) return;

    const pos = { lat, lng };
    mapInstanceRef.current.setCenter(pos);
    markerRef.current.setPosition(pos);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Geocodificar ( backend)
const handleBlur = async () => {
  const fullAddress = `${form.direccion}, ${form.ciudad}, ${form.provincia}, ${form.codigo_postal}`;
  if (!form.direccion || !form.ciudad) return;

  try {
    const res = await fetch(
      `${backendUrl}/api/geocode?address=${encodeURIComponent(fullAddress)}`
    );
    const data = await res.json();

    if (!res.ok) {
      console.log("GEOCODE ERROR:", data);
      return;
    }

    const { lat, lng } = data;
    setForm((prev) => ({ ...prev, latitud: lat, longitud: lng }));

    if (mapInstanceRef.current) updateMap(lat, lng);
    else initMap(lat, lng);
  } catch (err) {
    console.error("Error geocodificando:", err);
  }
};

  const handleSubmit = async () => {
  if (!store.user?.id) {
    alert("Usuario no cargado. Vuelve a iniciar sesión.");
    return;
  }

 
  let payload = { ...form };

  if (payload.latitud == null || payload.longitud == null) {
    const fullAddress = `${payload.direccion}, ${payload.ciudad}, ${payload.provincia}, ${payload.codigo_postal}`;
    if (!payload.direccion || !payload.ciudad) {
      alert("Completa al menos dirección y ciudad.");
      return;
    }

    try {
      const res = await fetch(
  `${backendUrl}/api/geocode?address=${encodeURIComponent(fullAddress)}`
);
const data = await res.json();

if (!res.ok) {
  console.log("GEOCODE ERROR:", data);
  alert("No se pudo obtener coordenadas para esa dirección.");
  return;
}

payload.latitud = data.lat;
payload.longitud = data.lng;

setForm((prev) => ({ ...prev, latitud: data.lat, longitud: data.lng }));

if (mapInstanceRef.current) updateMap(data.lat, data.lng);
else initMap(data.lat, data.lng);

    } catch (err) {
      console.error("Error geocodificando:", err);
      alert("Error geocodificando la dirección.");
      return;
    }
  }

  try {
    const resp = await fetch(`${backendUrl}/api/users/${store.user.id}/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload) 
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      alert(data?.msg || "Error guardando dirección");
      return;
    }

    navigate("/addresses");
  } catch (err) {
    console.error(err);
    alert("Error de red guardando dirección");
  }
};

  return (
    <div className="container mt-4">
      <h1>Añadir dirección</h1>

      <input className="form-control mt-3" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
      <input className="form-control mt-3" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} onBlur={handleBlur} />
      <input className="form-control mt-3" name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={handleChange} onBlur={handleBlur} />
      <input className="form-control mt-3" name="provincia" placeholder="Provincia" value={form.provincia} onChange={handleChange} onBlur={handleBlur} />
      <input className="form-control mt-3" name="codigo_postal" placeholder="Código postal" value={form.codigo_postal} onChange={handleChange} onBlur={handleBlur} />
      <input className="form-control mt-3" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />

    
      <div
        ref={mapRef}
        className="mt-4"
        style={{ width: "100%", height: "300px", borderRadius: "8px" }}
      />

      {form.latitud && (
        <p className="text-muted mt-2 small">
          📍 {form.latitud.toFixed(5)}, {form.longitud.toFixed(5)}
        </p>
      )}

      <button className="btn btn-success mt-4" onClick={handleSubmit}>
        Guardar
      </button>
    </div>
  );
}
