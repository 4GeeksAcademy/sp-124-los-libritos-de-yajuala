import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";


export default function CheckoutPaypalPay({ addressId }) {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "EUR",
        components: "buttons"
    };

    const createOrder = async () => {
        const cart = store.activeCart;

        const items = (cart.lineas || []).map((linea) => ({
            name: linea.libro.titulo,
            unit_amount: linea.precio.toFixed(2),
            quantity: linea.cantidad.toString(),
            category: "PHYSICAL_GOODS"
        }));


        const resp = await fetch(`${backendUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cart: {
                    items,
                    total: cart.monto_total
                }
            })
        });

        const data = await resp.json();
        return data.id;
    };


    const onApprove = async (data) => {
        const resp = await fetch(`${backendUrl}/api/orders/${data.orderID}/capture`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const result = await resp.json();

        if (!resp.ok) {
            alert(result.error || "Error capturando pago");
            return;
        }

        navigate("/payment-success");
    };




    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
                style={{ layout: "vertical", shape: "pill" }}
                createOrder={createOrder}
                onApprove={onApprove}
            />
        </PayPalScriptProvider>
    );
}
