import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import "../../../styles/client.css";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <nav className="breadcrumb">
            <span
              className="breadcrumb-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/user")}
            >
              Mi cuenta
            </span>
            <span className="breadcrumb-item active">Mis direcciones</span>
          </nav>

          <h1 className="h3 mb-1">Mis direcciones</h1>
          <p className="text-muted">
            {addresses.length}{" "}
            {addresses.length === 1 ? "dirección guardada" : "direcciones guardadas"}
          </p>
        </div>

        <button
          className="btn btn-success"
          onClick={() => navigate("/addresses/create")}
        >
          + Añadir dirección
        </button>
      </div>
      {addresses.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1"><FontAwesomeIcon icon={faLocationDot} /></div>
          <h4 className="mt-3">Sin direcciones</h4>
          <p className="text-muted">Añade una dirección para poder hacer pedidos.</p>

          <button
            className="btn btn-success btn-lg mt-3"
            onClick={() => navigate("/addresses/create")}
          >
            Añadir primera dirección
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {addresses.map((a) => (
            <div key={a.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100">

                <div className="card-body">
                  <div className="d-flex align-items-start gap-3">
                    <div className="fs-3"><FontAwesomeIcon icon={faLocationDot} /></div>

                    <div>
                      <h5 className="mb-1">{a.nombre}</h5>
                      <p className="text-muted mb-0" style={{ whiteSpace: "pre-line" }}>
                        {a.direccion}
                        {"\n"}
                        {a.ciudad}, {a.provincia}
                        {"\n"}
                        {a.codigo_postal}
                        {a.telefono ? `\nTel: ${a.telefono}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-white d-flex justify-content-between">
                  <button
                    className="btn btn-primary btn-sm w-100 me-2"
                    onClick={() => navigate(`/addresses/${a.id}/edit`)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteAddress(a.id)}
                  >
                    Eliminar
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/checkout/address")}
        >
          ← Volver a mi carrito
        </button>
      </div>

    </div>
  );

}
