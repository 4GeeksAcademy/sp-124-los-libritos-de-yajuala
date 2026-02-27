import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";

export default function CheckoutAddressPage() {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [addresses, setAddresses] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (!store.user) { navigate("/login"); return; }
        fetch(`${backendUrl}/api/users/${store.user.id}/addresses`)
            .then((r) => r.json())
            .then(setAddresses)
            .catch(console.error);
    }, [store.user]);

    const handleContinue = () => {
        if (!selected) { alert("Selecciona una dirección"); return; }
        navigate("/checkout/payment-method", { state: { addressId: selected } });
    };

    return (
        <div className="cl-page cl-page-narrow">

            {/* Pasos del checkout */}
            <div className="cl-checkout-steps" style={{ marginBottom: "32px" }}>
                <div className="cl-step active">
                    <div className="cl-step-num">1</div>
                    <span className="cl-step-label">Dirección</span>
                </div>
                <div className="cl-step-line" />
                <div className="cl-step">
                    <div className="cl-step-num">2</div>
                    <span className="cl-step-label">Pago</span>
                </div>
                <div className="cl-step-line" />
                <div className="cl-step">
                    <div className="cl-step-num">3</div>
                    <span className="cl-step-label">Confirmación</span>
                </div>
            </div>

            <h1 className="cl-title">Dirección de entrega</h1>
            <p className="cl-subtitle">¿Dónde enviamos tu pedido?</p>

            {/* Añadir nueva */}
            <button
                className="cl-btn cl-btn-ghost"
                style={{ marginBottom: "20px" }}
                onClick={() => navigate("/addresses/create")}
            >
                + Añadir nueva dirección
            </button>

            {addresses.length === 0 ? (
                <div className="cl-empty">
                    <div className="cl-empty-icon">📍</div>
                    <p className="cl-empty-title">Sin direcciones</p>
                    <p className="cl-empty-text">Añade una dirección para continuar con tu pedido.</p>
                    <button className="cl-btn cl-btn-primary" onClick={() => navigate("/addresses/create")}>
                        Añadir dirección
                    </button>
                </div>
            ) : (
                <>
                    {addresses.map((a) => (
                        <div
                            key={a.id}
                            className={`cl-address-option${selected === a.id ? " selected" : ""}`}
                            onClick={() => setSelected(a.id)}
                        >
                            <input type="radio" checked={selected === a.id} onChange={() => setSelected(a.id)} />
                            <div>
                                <div className="cl-address-name">{a.nombre}</div>
                                <div className="cl-address-detail">
                                    {a.direccion}<br />
                                    {a.ciudad}, {a.provincia} {a.codigo_postal}
                                    {a.telefono && <><br />Tel: {a.telefono}</>}
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        className="cl-btn cl-btn-accent cl-btn-lg cl-btn-block"
                        style={{ marginTop: "24px" }}
                        onClick={handleContinue}
                    >
                        Continuar al pago →
                    </button>
                </>
            )}
        </div>
    );
}
