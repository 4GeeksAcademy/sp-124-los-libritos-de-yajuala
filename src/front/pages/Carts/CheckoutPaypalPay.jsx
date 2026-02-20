import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

function Message({ content }) {
    return content ? <p className="mt-3 text-success fw-bold">{content}</p> : null;
}

export default function CheckoutPaypalPay({ addressId }) {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const cart = store.activeCart;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [message, setMessage] = useState("");

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "EUR",
        components: "buttons",
    };

    const createOrder = async () => {
        try {
            // Cogemos los items del carrito activo
            const itemsRes = await fetch(`${backendUrl}/api/carts/${cart.id}/items`);
            const items = await itemsRes.json();

            const total = items.reduce((acc, item) => {
                return acc + item.precio * (1 - item.descuento) * item.cantidad;
            }, 0);
            const response = await fetch(`${backendUrl}/api/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart: {
                        id: cart.id,
                        total: round(total),
                        items: items.map(item => ({
                            name: item.libro?.titulo || "Libro",
                            unit_amount: item.precio,
                            quantity: item.cantidad,
                            descuento: item.descuento
                        }))
                    }
                }),
            });

            if (!response.ok) throw new Error("Error del servidor creando orden");

            const orderData = await response.json();
            if (!orderData.id) throw new Error("No se recibió orderID del backend");

            return orderData.id;

        } catch (error) {
            console.error(error);
            setMessage("Error iniciando pago");
            throw error;
        }
    };

    const onApprove = async (data) => {
        try {
            const response = await fetch(
                `${backendUrl}/api/orders/${data.orderID}/capture`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) throw new Error("Error capturando orden");

            const orderData = await response.json();
            const transaction = orderData.purchase_units?.[0]?.payments?.captures?.[0];
            if (!transaction) throw new Error("No se encontró la captura");

            if (transaction.status === "COMPLETED") {
                const payRes = await fetch(`${backendUrl}/api/carts/${cart.id}/pay`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ address_id: addressId })
                });

                const payData = await payRes.json();

                if (!payRes.ok) {
                    setMessage(`Error actualizando carrito: ${payData.msg}`);
                    return;
                }

                // Actualizar el carrito activo en el store con el nuevo carrito vacio que nos devuelve el backend
                dispatch({
                    type: "set_active_cart",
                    payload: payData.nuevo_carrito
                });

                navigate("/payment-success", { state: { fromPaypal: true } });
            } else {
                setMessage(`Estado del pago inesperado: ${transaction.status}`);
            }

        } catch (error) {
            console.error(error);
            setMessage("Error capturando el pago");
        }
    };

    if (!cart) return <p>Cargando carrito...</p>;

    return (
        <div className="mt-3">
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{
                        shape: "pill",
                        layout: "vertical",
                        color: "gold",
                        label: "buynow",
                    }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                />
            </PayPalScriptProvider>
            <Message content={message} />
        </div>
    );
}

function round(val) {
    return Math.round(val * 100) / 100;
}