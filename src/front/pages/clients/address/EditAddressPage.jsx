import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";

export default function EditAddressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [form, setForm] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/addresses/${id}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.latitud || !data.longitud) {
          const fullAddress = `${data.direccion}, ${data.ciudad}, ${data.provincia}`;
          const res = await fetch(
            `${backendUrl}/api/geocode?address=${encodeURIComponent(fullAddress)}`
          );
          const geo = await res.json();

          if (res.ok) {
            data.latitud = geo.lat;
            data.longitud = geo.lng;
          } else {
            console.log("GEOCODE ERROR:", geo);
          }

        }
        setForm(data);
      });
  }, []);


  useEffect(() => {
    if (!form) return;

    const lat = form.latitud || 40.4168;
    const lng = form.longitud || -3.7038;

    if (window.google?.maps) {
      initMap(lat, lng);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap(lat, lng);
    document.head.appendChild(script);
  }, [form?.id]);

  const initMap = (lat, lng) => {
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15
    });


    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true
    });

    marker.addListener("dragend", (e) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setForm((prev) => ({ ...prev, latitud: newLat, longitud: newLng }));
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    await fetch(`${backendUrl}/api/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    navigate("/addresses");
  };

  if (!form) return <p>Cargando...</p>;

  return (
    <div className="container mt-4">
      <h1>Editar dirección</h1>

      <input className="form-control mt-3" name="nombre" value={form.nombre} onChange={handleChange} />
      <input className="form-control mt-3" name="direccion" value={form.direccion} onChange={handleChange} />
      <input className="form-control mt-3" name="ciudad" value={form.ciudad} onChange={handleChange} />
      <input className="form-control mt-3" name="provincia" value={form.provincia} onChange={handleChange} />
      <input className="form-control mt-3" name="codigo_postal" value={form.codigo_postal} onChange={handleChange} />
      <input className="form-control mt-3" name="telefono" value={form.telefono} onChange={handleChange} />

     
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
        Guardar cambios
      </button>
    </div>
  );
}
