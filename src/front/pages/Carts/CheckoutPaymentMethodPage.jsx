import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function CheckoutPaymentMethodPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const addressId = location.state?.addressId;

  const [selectedMethod, setSelectedMethod] = useState(null);

  const methods = [
    { id: "card", label: "Tarjeta de crédito / débito" },
    { id: "paypal", label: "PayPal" },
    { id: "cash", label: "Pago contra reembolso" },
    { id: "crypto", label: "Criptomonedas (prueba)" }
  ];

  const handleContinue = () => {
    if (!selectedMethod) {
      alert("Selecciona un método de pago");
      return;
    }

    navigate("/payment-success");

  };

  return (
    <div className="container mt-4">
      <h1>Método de pago</h1>

      <ul className="list-group mt-3">
        {methods.map((m) => (
          <li
            key={m.id}
            className={`list-group-item d-flex align-items-center gap-3 ${
              selectedMethod === m.id ? "active" : ""
            }`}
            onClick={() => setSelectedMethod(m.id)}
            style={{ cursor: "pointer" }}
          >
            <input
              type="radio"
              checked={selectedMethod === m.id}
              onChange={() => setSelectedMethod(m.id)}
            />
            {m.label}
          </li>
        ))}
      </ul>

      <button className="btn btn-success mt-4" onClick={handleContinue}>
        Continuar
      </button>
    </div>
  );
}
