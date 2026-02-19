import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom"

function Message({ content }) {
    return <p>{content}</p>;
}

function PasarelaPago() {

    const navigate = useNavigate();
    const location = useLocation();
    const { cart, items, total } = location.state || {};

    const [message, setMessage] = useState("");

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "EUR",
        components: "buttons",
    };

    const createOrder = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cart: {
                            id: cart?.id,
                            total: total,
                            items: items?.map(item => ({
                                name: item.libro.titulo,
                                unit_amount: item.precio,
                                quantity: item.cantidad,
                                descuento: item.descuento
                            }))
                        }
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Error del servidor creando orden");
            }

            const orderData = await response.json();

            if (!orderData.id) {
                throw new Error("No se recibió orderID del backend");
            }

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
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/${data.orderID}/capture`,
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
                const addrRes = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/users/${cart.id_cliente}/addresses`
                );
                const addresses = await addrRes.json();
                const addressId = addresses[0]?.id;
                await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/carts/${cart.id}/pay`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ address_id: addressId })
                    }
                );
                setMessage(`Pago completado: ${transaction.status}`);
                navigate(`/carts/${cart.id}`);
            }

            setErrorMessage(`Error en el estado del pago: ${transaction?.status || "Desconocido"}`);

        } catch (error) {
            console.error(error);
            setMessage("Error capturando el pago");
        }
    };


    return (
        <div className="PasarelaPago">
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

export default PasarelaPago;
