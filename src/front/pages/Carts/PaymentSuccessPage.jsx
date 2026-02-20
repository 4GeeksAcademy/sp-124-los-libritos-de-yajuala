import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function PaymentSuccessPage() {
    const { store, actions } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const fromPaypal = location.state?.fromPaypal;

    useEffect(() => {
        const pay = async () => {
            if (!store.user) return;

            // Si viene de PayPal, el carrito ya está pagado — solo limpiamos
            if (fromPaypal) {
                actions.clearCart();
                localStorage.removeItem("cart");
                return;
            }

            const res = await fetch(`${backendUrl}/api/clients/${store.user.id}/carts/active`);
            const data = await res.json();

            if (data.active) {
                await fetch(`${backendUrl}/api/carts/${data.cart.id}/pay`, {
                    method: "POST"
                });
            }

            actions.clearCart();
            localStorage.removeItem("cart");
        };

        pay();
    }, []);

    return (
        <div className="container mt-4 text-center">
            <h1>¡Pago realizado con éxito!</h1>
            <p>Gracias por tu compra.</p>
            <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/home-client")}
            >
                Seguir comprando
            </button>
        </div>
    );
}