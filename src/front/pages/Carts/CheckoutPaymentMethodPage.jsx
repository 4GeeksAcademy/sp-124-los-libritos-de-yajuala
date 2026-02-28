import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/client.css";

const METHODS = [
  { id: "card", label: "Tarjeta de crédito / débito", icon: "💳" },
  { id: "paypal", label: "PayPal", icon: "🅿️" },
  { id: "google_test", label: "Google Pay", icon: "🔵" },
  { id: "cash", label: "Contra reembolso", icon: "💵" },
  { id: "crypto", label: "Criptomonedas", icon: "₿" },
];

export default function CheckoutPaymentMethodPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const addressId = location.state?.addressId;
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) { alert("Selecciona un método de pago"); return; }
    if (!addressId) { alert("No hay dirección seleccionada"); return; }
    if (selected === "google_test") {
      navigate("/checkout/google", { state: { addressId } });
      return;
    }
    navigate("/checkout/payment", { state: { addressId, paymentMethod: selected } });
  };

  return (
    <div className="cl-page cl-page-narrow">

      {/* Pasos */}
      <div className="cl-checkout-steps" style={{ marginBottom: "32px" }}>
        <div className="cl-step done">
          <div className="cl-step-num">✓</div>
          <span className="cl-step-label">Dirección</span>
        </div>
        <div className="cl-step-line" />
        <div className="cl-step active">
          <div className="cl-step-num">2</div>
          <span className="cl-step-label">Pago</span>
        </div>
        <div className="cl-step-line" />
        <div className="cl-step">
          <div className="cl-step-num">3</div>
          <span className="cl-step-label">Confirmación</span>
        </div>
      </div>

      <h1 className="cl-title">Método de pago</h1>
      <p className="cl-subtitle">Elige cómo quieres pagar</p>

      {METHODS.map((m) => (
        <div
          key={m.id}
          className={`cl-payment-option${selected === m.id ? " selected" : ""}`}
          onClick={() => setSelected(m.id)}
        >
          <input type="radio" checked={selected === m.id} onChange={() => setSelected(m.id)} />
          <span className="cl-payment-icon">{m.icon}</span>
          <span className="cl-payment-label">{m.label}</span>
        </div>
      ))}

      <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
        <button className="cl-btn cl-btn-ghost" onClick={() => navigate(-1)}>← Atrás</button>
        <button className="cl-btn cl-btn-accent cl-btn-lg" style={{ flex: 1, justifyContent: "center" }} onClick={handleContinue}>
          Continuar →
        </button>
      </div>
    </div>
  );
}
