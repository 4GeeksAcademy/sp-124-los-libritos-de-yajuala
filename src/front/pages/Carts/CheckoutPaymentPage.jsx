import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import CheckoutPaypalPay from "./CheckoutPaypalPay";
import "../../styles/client.css";
import React from "react";
import { faCcVisa, faCcPaypal, faGooglePay, faMoneyBillWave, faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

const METHOD_LABELS = {
  card: "Tarjeta de crédito / débito",
  paypal: "PayPal",
  google_test: "Google Pay",
  cash: "Contra reembolso",
  crypto: "Criptomonedas",
};
const METHOD_ICONS = { card: <FontAwesomeIcon icon={faCcVisa} />, paypal: <FontAwesomeIcon icon={faCcPaypal} />, google_test: <FontAwesomeIcon icon={faGooglePay} />, cash: <FontAwesomeIcon icon={faMoneyBillWave} />, crypto: <FontAwesomeIcon icon={faBitcoin} /> };

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
          .then((data) => dispatch({ type: "set_active_cart", payload: data.cart }));
      }
    }
  }, [store.activeCart?.id]);



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

        <div className="text-center opacity-50">
          <div className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36 }}>
            ✓
          </div>
          <small className="d-block mt-1">Pago</small>
        </div>

        <div className="flex-grow-1 border-top" />

        <div className="text-center">
          <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36 }}>
            3
          </div>
          <small className="d-block mt-1">Confirmación</small>
        </div>
      </div>
      <h1 className="h3 mb-1">Confirmar pedido</h1>
      <p className="text-muted mb-4">Revisa los detalles antes de pagar</p>
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <strong><FontAwesomeIcon icon={faLocationDot} /> Dirección de entrega</strong>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            Cambiar
          </button>
        </div>

        <div className="card-body">
          <h5 className="fw-bold text-primary mb-1">{address.nombre}</h5>
          <p className="text-muted mb-0" style={{ whiteSpace: "pre-line" }}>
            {address.direccion}
            {"\n"}
            {address.ciudad}, {address.provincia} {address.codigo_postal}
            {address.telefono ? `\nTel: ${address.telefono}` : ""}
          </p>
        </div>
      </div>
      <div className="card shadow-sm mb-3">
        <div className="card-header bg-white">
          <strong>{METHOD_ICONS[paymentMethod]} Método de pago</strong>
        </div>

        <div className="card-body">
          <h5 className="fw-bold text-primary mb-0">
            {METHOD_LABELS[paymentMethod] || paymentMethod}
          </h5>
        </div>
      </div>
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <strong>Resumen del pedido</strong>
        </div>

        <div className="card-body">
          <div className="d-flex justify-content-between fs-5 fw-bold">
            <span>Total a pagar</span>
            <span>{Number(total).toFixed(2)} €</span>
          </div>
        </div>
      </div>
      {paymentMethod === "paypal" ? (
        <CheckoutPaypalPay addressId={addressId} />
      ) : (
        <button
          className="btn btn-success btn-lg w-100"
          onClick={handlePay}
          disabled={paying}
        >
          {paying ? "Procesando..." : "✓ Confirmar y pagar"}
        </button>
      )}

    </div>
  );

}
