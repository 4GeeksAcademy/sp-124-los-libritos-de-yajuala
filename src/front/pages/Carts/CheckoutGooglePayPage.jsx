import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function CheckoutGooglePayPage() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const addressId = location.state?.addressId;

  const gpayBtnRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [gpayReady, setGpayReady] = useState(false);

 
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
          dispatch({ type: "set_active_cart", payload: data.cart });
        });
    }
  }, [store.user?.id]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.payments?.api) {
        clearInterval(interval);
        initGooglePay();
      }
    }, 200);

    
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const initGooglePay = async () => {
    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: "TEST"
      });

    
      const isReadyRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: "CARD",
            parameters: {
              allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
              allowedCardNetworks: ["VISA", "MASTERCARD", "AMEX"]
            }
          }
        ]
      };

      const res = await paymentsClient.isReadyToPay(isReadyRequest);

      if (res.result) {
        setGpayReady(true);

        
        if (gpayBtnRef.current) {
          gpayBtnRef.current.innerHTML = "";
          const button = paymentsClient.createButton({
            onClick: () => onGooglePayClicked(paymentsClient)
          });
          gpayBtnRef.current.appendChild(button);
        }
      }

      setLoading(false);
    } catch (e) {
      console.error("Google Pay init error:", e);
      setLoading(false);
    }
  };

  const onGooglePayClicked = async (paymentsClient) => {
    if (!addressId) {
      alert("No hay dirección seleccionada");
      return;
    }
    if (!store.activeCart?.id) {
      alert("Carrito no encontrado");
      return;
    }


    const total = Number(store.activeCart.monto_total || 0.01).toFixed(2);

   
    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["VISA", "MASTERCARD", "AMEX"]
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "example",
              gatewayMerchantId: "exampleGatewayMerchantId"
            }
          }
        }
      ],
      merchantInfo: {
        merchantName: "Los Libritos (TEST)"
      },
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPrice: total,
        currencyCode: "EUR"
      }
    };

    try {
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

  
      const resp = await fetch(`${backendUrl}/api/payments/google/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: store.activeCart.id,
          address_id: addressId,
          paymentData 
        })
      });

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.msg || "Error en confirmación backend");
        return;
      }

      dispatch({ type: "set_active_cart", payload: data.nuevo_carrito });
      navigate("/payment-success");
    } catch (err) {
     
      console.error("Google Pay error:", err);
      alert("Pago cancelado o error en Google Pay (TEST)");
    }
  };

  return (
    <div className="container mt-4">
      <h1>Google Pay (modo TEST)</h1>
      <p>No se realizará ningún cobro real.</p>

      {loading && <p>Cargando Google Pay...</p>}

      {!loading && !gpayReady && (
        <div className="alert alert-warning">
          Google Pay no está disponible en este navegador/entorno.
        </div>
      )}

      <div ref={gpayBtnRef} className="mt-3" />
    </div>
  );
}

