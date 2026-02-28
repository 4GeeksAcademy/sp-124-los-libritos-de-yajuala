import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/client.css";
import { faCcVisa, faCcPaypal, faGooglePay, faMoneyBillWave, faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const METHODS = [
  { id: "card", label: "Tarjeta de crédito / débito", icon: <FontAwesomeIcon icon={faCcVisa} /> },
  { id: "paypal", label: "PayPal", icon: <FontAwesomeIcon icon={faCcPaypal} /> },
  { id: "google_test", label: "Google Pay", icon: <FontAwesomeIcon icon={faGooglePay} /> },
  { id: "cash", label: "Contra reembolso", icon: <FontAwesomeIcon icon={faMoneyBillWave} /> },
  { id: "crypto", label: "Criptomonedas", icon: <FontAwesomeIcon icon={faBitcoin} /> },
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
  <div className="container-fluid py-4">
    <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
      <div className="text-center opacity-50">
        <div className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center"
             style={{ width: 36, height: 36 }}>
          ✓
        </div>
        <small className="d-block mt-1">Dirección</small>
      </div>

      <div className="flex-grow-1 border-top" />

      <div className="text-center">
        <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
             style={{ width: 36, height: 36 }}>
          2
        </div>
        <small className="d-block mt-1">Pago</small>
      </div>

      <div className="flex-grow-1 border-top" />

      <div className="text-center opacity-50">
        <div className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center"
             style={{ width: 36, height: 36 }}>
          3
        </div>
        <small className="d-block mt-1">Confirmación</small>
      </div>
    </div>
    <h1 className="h3 mb-1">Método de pago</h1>
    <p className="text-muted mb-4">Elige cómo quieres pagar</p>
    <div className="list-group mb-4">
      {METHODS.map((m) => (
        <label
          key={m.id}
          className={`list-group-item d-flex align-items-center gap-3 ${selected === m.id ? "border-primary" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setSelected(m.id)}
        >
          <input
            type="radio"
            className="form-check-input"
            checked={selected === m.id}
            onChange={() => setSelected(m.id)}
          />
          <span style={{ fontSize: "1.4rem" }}>{m.icon}</span>
          <span>{m.label}</span>
        </label>
      ))}
    </div>
    <div className="d-flex gap-3 mt-4">
      <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
        ← Atrás
      </button>

      <button
        className="btn btn-success btn-lg flex-grow-1"
        onClick={handleContinue}
      >
        Continuar →
      </button>
    </div>

  </div>
);

}
