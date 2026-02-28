import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import "../../../styles/client.css";

export default function AddressesPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch(`${backendUrl}/api/users/${store.user.id}/addresses`);
    const data = await res.json();
    setAddresses(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    if (!store.user) navigate("/login");
    else load();
  }, [store.user]);

  const deleteAddress = async (id) => {
    if (!confirm("¿Eliminar esta dirección?")) return;
    await fetch(`${backendUrl}/api/addresses/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="cl-page"><div className="cl-loader">Cargando direcciones</div></div>;

  return (
    <div className="cl-page cl-page-wide">

      {/* Cabecera */}
      <div className="cl-page-header">
        <div className="cl-page-header-left">
          <div className="cl-breadcrumb">
            <span onClick={() => navigate("/user")} style={{ cursor: "pointer" }}>Mi cuenta</span>
            <span>›</span>
            <span>Mis direcciones</span>
          </div>
          <h1 className="cl-title">Mis direcciones</h1>
          <p className="cl-subtitle">{addresses.length} {addresses.length === 1 ? "dirección guardada" : "direcciones guardadas"}</p>
        </div>
        <button className="cl-btn cl-btn-accent" onClick={() => navigate("/addresses/create")}>
          + Añadir dirección
        </button>
      </div>

      {/* Lista vacía */}
      {addresses.length === 0 ? (
        <div className="cl-empty">
          <div className="cl-empty-icon">📍</div>
          <p className="cl-empty-title">Sin direcciones</p>
          <p className="cl-empty-text">Añade una dirección para poder hacer pedidos.</p>
          <button className="cl-btn cl-btn-accent cl-btn-lg" onClick={() => navigate("/addresses/create")}>
            Añadir primera dirección
          </button>
        </div>
      ) : (
        <div className="cl-addresses-grid">
          {addresses.map((a) => (
            <div key={a.id} className="cl-address-card">
              <div className="cl-address-card-icon">📍</div>
              <div className="cl-address-card-body">
                <p className="cl-address-card-name">{a.nombre}</p>
                <p className="cl-address-card-detail">
                  {a.direccion}<br />
                  {a.ciudad}, {a.provincia}<br />
                  {a.codigo_postal}
                  {a.telefono && <><br />Tel: {a.telefono}</>}
                </p>
              </div>
              <div className="cl-address-card-footer">
                <button
                  className="cl-btn cl-btn-primary cl-btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => navigate(`/addresses/${a.id}/edit`)}
                >
                  Editar
                </button>
                <button
                  className="cl-btn cl-btn-danger cl-btn-sm"
                  onClick={() => deleteAddress(a.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Volver */}
      <div style={{ marginTop: "32px" }}>
        <button className="cl-btn cl-btn-ghost" onClick={() => navigate("/user")}>
          ← Volver a mi cuenta
        </button>
      </div>

    </div>
  );
}
