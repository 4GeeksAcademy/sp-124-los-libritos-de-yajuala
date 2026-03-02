import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";
import { faBox, faCalendarDays, faCartArrowDown, faLocationDot, faCcVisa } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const STATUS_LABEL = {
  pendiente: "Pendiente",
  pagado:    "Pagado",
  enviado:   "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function LoggedCartClientPage() {
  const { store } = useGlobalReducer();
  const navigate  = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [carritos, setCarritos] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!store.user) { navigate("/login"); return; }
    fetch(`${backendUrl}/api/clients/${store.user.id}/carts`)
      .then((r) => r.json())
      .then((data) => setCarritos(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [store.user]);

  if (loading) return <div className="cl-page"><div className="cl-loader">Cargando historial</div></div>;

  const historial = carritos.filter((c) => c.estado !== "pendiente");
  const activo    = carritos.find((c) => c.estado === "pendiente");

  return (
    <div className="cl-page cl-page-wide">

      <div className="cl-page-header">
        <div className="cl-page-header-left">
          <div className="cl-breadcrumb">
            <span onClick={() => navigate("/user")} style={{ cursor: "pointer" }}>Mi cuenta</span>
            <span>›</span>
            <span>Historial de pedidos</span>
          </div>
          <h1 className="cl-title">Mis pedidos</h1>
          <p className="cl-subtitle">{historial.length} {historial.length === 1 ? "pedido" : "pedidos"} realizados</p>
        </div>
        {activo && (
          <button className="cl-btn cl-btn-accent" onClick={() => navigate("/user/cart")}>
            <FontAwesomeIcon icon={faCartArrowDown} /> Ver carrito activo
          </button>
        )}
      </div>

      {historial.length === 0 ? (
        <div className="cl-empty">
          <div className="cl-empty-icon"><FontAwesomeIcon icon={faBox} /></div>
          <p className="cl-empty-title">Sin pedidos todavía</p>
          <p className="cl-empty-text">Cuando realices tu primer pedido aparecerá aquí.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="cl-btn cl-btn-accent cl-btn-lg" onClick={() => navigate("/home-client")}>
              Ver libros
            </button>
            <button className="cl-btn cl-btn-ghost cl-btn-lg" onClick={() => navigate("/user")}>
              Mi cuenta
            </button>
          </div>
        </div>
      ) : (
        historial.map((c) => (
          <div key={c.id} className="cl-order-card">
            <div className="cl-order-card-header">
              <span className="cl-order-id">Pedido #{c.id}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={`cl-order-status cl-status-${c.estado}`}>
                  {STATUS_LABEL[c.estado] ?? c.estado}
                </span>
                <span className="cl-order-total">{Number(c.monto_total).toFixed(2)} €</span>
              </div>
            </div>
            <div className="cl-order-card-body">
              <div className="cl-order-meta">
                {c.fecha && (
                  <span><FontAwesomeIcon icon={faCalendarDays} /> {new Date(c.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
                )}
                {c.direccion_entrega && <span><FontAwesomeIcon icon={faLocationDot} /> {c.direccion_entrega}</span>}
                {c.metodo_pago && <span><FontAwesomeIcon icon={faCcVisa} /> {c.metodo_pago}</span>}
              </div>
              <div style={{ marginTop: "14px" }}>
                <button
                  className="cl-btn cl-btn-primary cl-btn-sm"
                  onClick={() => navigate(`/carts/${c.id}`)}
                >
                  Ver detalle →
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <div style={{ marginTop: "24px" }}>
        <button className="cl-btn cl-btn-ghost" onClick={() => navigate("/user")}>
          ← Volver a mi cuenta
        </button>
      </div>

    </div>
  );
}
