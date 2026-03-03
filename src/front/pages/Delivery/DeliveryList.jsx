
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Home.css";

export const Delivery = () => {
  const navigate = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("token");

  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCartId, setSelectedCartId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchJson = async (url, options = {}) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const resp = await fetch(url, {
      ...options,
      headers,
    });

    const text = await resp.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (resp.status === 401) {
      alert("Sesión expirada. Inicia sesión nuevamente.");
      navigate("/delivery/login");
      throw new Error("Unauthorized");
    }

    if (!resp.ok) {
      throw new Error(data?.msg || `Error (${resp.status})`);
    }

    return data;
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [a, m] = await Promise.all([
        fetchJson(`${backendUrl}/api/delivery/orders/available`),
        fetchJson(`${backendUrl}/api/delivery/orders`),
      ]);

      setAvailable(Array.isArray(a) ? a : a?.orders || []);
      setMine(Array.isArray(m) ? m : m?.orders || []);
    } catch (e) {
      if (e.message !== "Unauthorized") alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const claimOrder = async (cartId) => {
    try {
      await fetchJson(`${backendUrl}/api/delivery/orders/${cartId}/claim`, {
        method: "POST",
      });
      await loadOrders();
    } catch (e) {
      if (e.message !== "Unauthorized") alert(e.message);
    }
  };

  const markDelivered = async (cartId) => {
    try {
      await fetchJson(`${backendUrl}/api/delivery/orders/${cartId}/delivered`, {
        method: "PUT",
      });
      await loadOrders();
      if (selectedCartId === cartId) {
        setSelectedCartId(null);
        setDetail(null);
      }
    } catch (e) {
      if (e.message !== "Unauthorized") alert(e.message);
    }
  };

  const openDetail = async (cartId) => {
    setSelectedCartId(cartId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await fetchJson(`${backendUrl}/api/delivery/orders/${cartId}`);
      setDetail(d);
    } catch (e) {
      if (e.message !== "Unauthorized") alert(e.message);
      setSelectedCartId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/delivery/login");
      return;
    }
    loadOrders();
  }, []);

  if (loading) return <p className="mt-3">Cargando pedidos...</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Pedidos del repartidor</h2>
        <button
          className="btn btn-outline-custom btn-sm"
          onClick={loadOrders}
        >
          Recargar
        </button>
      </div>

      <div className="row">
        <div className="col-12 col-lg-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Disponibles</strong>
              <span className="badge bg-secondary">{available.length}</span>
            </div>

            <div className="card-body">
              {available.length === 0 ? (
                <p className="text-muted m-0">No hay pedidos disponibles.</p>
              ) : (
                <div className="list-group">
                  {available.map((o) => {
                    const cartId = o.cart_id ?? o.cartId ?? o.id;
                    const total = o.total ?? o.monto_total ?? "-";
                    return (
                      <div
                        key={cartId}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div>
                            <strong>Cart:</strong> {cartId}
                          </div>
                          <div className="text-muted" style={{ fontSize: 13 }}>
                            Total: {total}
                          </div>
                        </div>

                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => claimOrder(cartId)}
                        >
                          Aceptar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Mis pedidos</strong>
              <span className="badge bg-primary">{mine.length}</span>
            </div>

            <div className="card-body">
              {mine.length === 0 ? (
                <p className="text-muted m-0">No tienes pedidos asignados.</p>
              ) : (
                <div className="list-group">
                  {mine.map((o) => {
                    const cartId = o.cart_id ?? o.cartId ?? o.id;
                    const status = o.status ?? "-";
                    const total = o.total ?? o.monto_total ?? "-";

                    return (
                      <div
                        key={cartId}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div>
                            <strong>Cart:</strong> {cartId}{" "}
                            <span className="badge bg-light text-dark ms-2">
                              {status}
                            </span>
                          </div>
                          <div className="text-muted" style={{ fontSize: 13 }}>
                            Total: {total}
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openDetail(cartId)}
                          >
                            Ver
                          </button>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => markDelivered(cartId)}
                            disabled={status === "delivered"}
                          >
                            Entregado
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {selectedCartId && (
            <div className="card mt-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <strong>Detalle cart {selectedCartId}</strong>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setSelectedCartId(null);
                    setDetail(null);
                  }}
                >
                  Cerrar
                </button>
              </div>

              <div className="card-body">
                {detailLoading ? (
                  <p className="m-0">Cargando detalle...</p>
                ) : !detail ? (
                  <p className="text-muted m-0">Sin detalle.</p>
                ) : (
                  <>
                    {detail.address && (
                      <div className="mb-3">
                        <h6>Dirección</h6>
                        <div className="text-muted">
                          {detail.address.nombre} — {detail.address.direccion},{" "}
                          {detail.address.ciudad}, {detail.address.provincia},{" "}
                          {detail.address.codigo_postal}
                        </div>
                        {detail.address.telefono && (
                          <div className="text-muted">
                            Tel: {detail.address.telefono}
                          </div>
                        )}


                        {detail.address.latitud != null &&
                          detail.address.longitud != null && (
                            <DeliveryMap
                              lat={detail.address.latitud}
                              lng={detail.address.longitud}
                            />
                          )}
                      </div>
                    )}

                    <div className="mb-2">
                      <h6>Items</h6>
                      {!detail.items || detail.items.length === 0 ? (
                        <p className="text-muted m-0">Sin items.</p>
                      ) : (
                        <ul className="mb-0">
                          {detail.items.map((it, idx) => (
                            <li key={it.id ?? it.cart_book_id ?? idx}>
                              {it.titulo ?? it.libro?.titulo ?? "Libro"} — x
                              {it.cantidad}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-3">
                      <strong>Total:</strong>{" "}
                      {detail.total ?? detail.monto_total ?? "-"}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function DeliveryMap({ lat, lng }) {
  const mapRef = React.useRef(null);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  React.useEffect(() => {
    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return;

    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latNum, lng: lngNum },
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: "none",
        draggable: false,
      });

      new window.google.maps.Marker({
        position: { lat: latNum, lng: lngNum },
        map,
      });
    };

    if (window.google?.maps) {
      initMap();
      return;
    }


    const existing = document.querySelector('script[data-google-maps="1"]');
    if (existing) {
      existing.addEventListener("load", initMap);
      return () => existing.removeEventListener("load", initMap);
    }

    const script = document.createElement("script");
    script.dataset.googleMaps = "1";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, [lat, lng, googleMapsApiKey]);

  return (
    <div
      ref={mapRef}
      className="mt-2"
      style={{ width: "100%", height: "200px", borderRadius: "8px" }}
    />
  );
}
