import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import CheckoutPaypalPay from "./CheckoutPaypalPay";

export default function CheckoutPaymentPage() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const addressId = location.state?.addressId;
  const paymentMethod = location.state?.paymentMethod;

  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (!store.user?.id) return;

    const needsCart =
      !store.activeCart ||
      store.activeCart.id_cliente !== store.user.id ||
      store.activeCart.estado !== "pendiente";

    if (needsCart) {
      fetch(`${backendUrl}/api/users/${store.user.id}/active-cart`)
        .then((res) => res.json())
        .then((data) => {
          dispatch({ type: "set_active_cart", payload: data });
        });
    }
  }, [store.user?.id]);

  useEffect(() => {
    if (!addressId) return;

    fetch(`${backendUrl}/api/addresses/${addressId}`)
      .then((res) => res.json())
      .then((data) => setAddress(data))
      .catch((err) => console.error(err));
  }, [addressId]);

  const handlePay = async () => {
    if (!store.activeCart) {
      alert("Carrito no cargado");
      return;
    }

    try {
      const resp = await fetch(
        `${backendUrl}/api/carts/${store.activeCart.id}/pay`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address_id: addressId, payment_method: paymentMethod })
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.msg || "Error al pagar");
        return;
      }

      dispatch({ type: "set_active_cart", payload: data.nuevo_carrito });
      navigate("/payment-success");
    } catch (err) {
      console.error(err);
      alert("Error procesando pago");
    }
  };

  if (!address || !store.activeCart) return <p>Cargando...</p>;

  return (
    <div className="container mt-4">
      <h1>Confirmar pago</h1>

      <h4 className="mt-4">Dirección seleccionada:</h4>
      <div className="border rounded p-3 mt-2">
        <b>{address.nombre}</b>
        <div>{address.direccion}</div>
        <div>{address.ciudad}, {address.provincia}</div>
        <div>{address.codigo_postal}</div>
        {address.telefono && <div>Tel: {address.telefono}</div>}
      </div>

      <h4 className="mt-4">Método de pago:</h4>
      <div className="border rounded p-3 mt-2">
        {paymentMethod}
      </div>

      {paymentMethod === "paypal" ? (
        <CheckoutPaypalPay addressId={addressId} />
      ) : (
        <button className="btn btn-success mt-4" onClick={handlePay}>
          Confirmar pago
        </button>
      )}
    </div>
  );
}
