import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function CheckoutPaypalPay({ addressId }) {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!store.activeCart || !store.activeCart.items || store.activeCart.items.length === 0) {
        return <p>Cargando carrito...</p>;
    }

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "EUR",
        components: "buttons"
    };


    const items = store.activeCart.items;

    const total = items.reduce(
        (sum, item) => sum + item.precio * item.cantidad,
        0
    );

    console.log("TOTAL CALCULADO PARA PAYPAL:", total);
    console.log("ITEMS ENVIADOS A PAYPAL:", items);

    const createOrder = async () => {
        const paypalItems = items.map((item) => ({
            name: item.libro.titulo,
            unit_amount: {
                currency_code: "EUR",
                value: item.precio.toFixed(2)
            },
            quantity: item.cantidad.toString(),
            category: "PHYSICAL_GOODS"
        }));

        const resp = await fetch(`${backendUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cart: {
                    items: paypalItems,
                    total: total.toFixed(2)
                }
            })
        });

        if (!resp.ok) {
            const error = await resp.text();
            console.error("ERROR EN /orders:", error);
            throw new Error("No se pudo crear la orden");
        }

        const data = await resp.json();
        return data.id;
    };

    const onApprove = async (data) => {
        const resp = await fetch(`${backendUrl}/api/orders/${data.orderID}/capture`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: store.user.id,
                cart_id: store.activeCart.id
            })
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
