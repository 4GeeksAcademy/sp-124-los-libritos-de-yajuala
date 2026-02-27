import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import CheckoutPaypalPay from "./CheckoutPaypalPay";
import "../../styles/client.css";

const METHOD_LABELS = {
  card: "Tarjeta de crédito / débito",
  paypal: "PayPal",
  google_test: "Google Pay",
  cash: "Contra reembolso",
  crypto: "Criptomonedas",
};
const METHOD_ICONS = { card: "💳", paypal: "🅿️", google_test: "🔵", cash: "💵", crypto: "₿" };

export default function CheckoutPaymentPage() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const addressId = location.state?.addressId;
  const paymentMethod = location.state?.paymentMethod;
  const [address, setAddress] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (store.user?.id) {
      const needsCart = !store.activeCart || store.activeCart.id_cliente !== store.user.id || store.activeCart.estado !== "pendiente";
      if (needsCart) {
        fetch(`${backendUrl}/api/users/${store.user.id}/active-cart`)
          .then((r) => r.json())
          .then((data) => dispatch({ type: "set_active_cart", payload: data }));
      }
    }
  }, [store.user?.id]);

  useEffect(() => {
    if (addressId) {
      fetch(`${backendUrl}/api/addresses/${addressId}`)
        .then((r) => r.json())
        .then(setAddress);
    }
  }, [addressId]);

  const handlePay = async () => {
    if (!store.activeCart) { alert("Carrito no cargado"); return; }
    setPaying(true);
    try {
      const resp = await fetch(`${backendUrl}/api/carts/${store.activeCart.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address_id: addressId, payment_method: paymentMethod }),
      });
      const data = await resp.json();
      if (!resp.ok) { alert(data.msg || "Error al pagar"); return; }
      dispatch({ type: "set_active_cart", payload: data.nuevo_carrito });
      navigate("/payment-success");
    } catch { alert("Error procesando pago"); }
    finally { setPaying(false); }
  };

  if (!address || !store.activeCart) return <div className="cl-page"><div className="cl-loader">Cargando</div></div>;

  const total = store.activeCart.monto_total ?? 0;

  return (
    <div className="cl-page cl-page-narrow">

      {/* Pasos */}
      <div className="cl-checkout-steps" style={{ marginBottom: "32px" }}>
        {["Dirección", "Pago", "Confirmación"].map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className="cl-step-line" />}
            <div className={`cl-step${i < 2 ? " done" : " active"}`}>
              <div className="cl-step-num">{i < 2 ? "✓" : i + 1}</div>
              <span className="cl-step-label">{s}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <h1 className="cl-title">Confirmar pedido</h1>
      <p className="cl-subtitle">Revisa los detalles antes de pagar</p>

      {/* Resumen dirección */}
      <div className="cl-card" style={{ marginBottom: "16px" }}>
        <div className="cl-card-header">
          <span className="cl-card-header-title">📍 Dirección de entrega</span>
          <button className="cl-btn cl-btn-ghost cl-btn-sm" onClick={() => navigate(-1)}>Cambiar</button>
        </div>
        <div className="cl-card-body">
          <p style={{ margin: 0, fontWeight: 700, color: "var(--cl-blue)", marginBottom: "4px" }}>{address.nombre}</p>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--cl-text-muted)", lineHeight: 1.6 }}>
            {address.direccion}<br />
            {address.ciudad}, {address.provincia} {address.codigo_postal}
            {address.telefono && <><br />Tel: {address.telefono}</>}
          </p>
        </div>
      </div>

      {/* Resumen método de pago */}
      <div className="cl-card" style={{ marginBottom: "24px" }}>
        <div className="cl-card-header">
          <span className="cl-card-header-title">{METHOD_ICONS[paymentMethod]} Método de pago</span>
        </div>
        <div className="cl-card-body">
          <p style={{ margin: 0, fontWeight: 700, color: "var(--cl-blue)" }}>
            {METHOD_LABELS[paymentMethod] || paymentMethod}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="cl-order-summary" style={{ marginBottom: "24px" }}>
        <div className="cl-order-summary-header">Resumen del pedido</div>
        <div className="cl-order-summary-body">
          <div className="cl-order-summary-total">
            <span>Total a pagar</span>
            <span>{Number(total).toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Acción */}
      {paymentMethod === "paypal" ? (
        <CheckoutPaypalPay addressId={addressId} />
      ) : (
        <button
          className="cl-btn cl-btn-success cl-btn-lg cl-btn-block"
          onClick={handlePay}
          disabled={paying}
        >
          {paying ? "Procesando..." : "✓ Confirmar y pagar"}
        </button>
      )}
    </div>
  );
}
