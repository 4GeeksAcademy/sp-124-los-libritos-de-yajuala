import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
        <div className="container-fluid py-4">
            <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                <div className="text-center">
                    <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36 }}>
                        1
                    </div>
                    <small className="d-block mt-1">Dirección</small>
                </div>

                <div className="flex-grow-1 border-top" />

                <div className="text-center opacity-50">
                    <div className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36 }}>
                        2
                    </div>
                    <small className="d-block mt-1">Pago</small>
                </div>

                <div className="flex-grow-1 border-top" />

                <div className="text-center opacity-50">
                    <div className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36 }}>
                        3
                    </div>
                    <small className="d-block mt-1">Confirmación</small>
                </div>
            </div>
            <h1 className="h3 mb-1">Dirección de entrega</h1>
            <p className="text-muted mb-3">¿Dónde enviamos tu pedido?</p>
            <button
                className="btn btn-outline-secondary mb-4"
                onClick={() => navigate("/addresses/create")}
            >
                + Añadir nueva dirección
            </button>
            {addresses.length === 0 ? (
                <div className="text-center py-5">
                    <div className="fs-1"><FontAwesomeIcon icon={faLocationDot} /></div>
                    <h4 className="mt-3">Sin direcciones</h4>
                    <p className="text-muted">Añade una dirección para continuar con tu pedido.</p>

                    <button
                        className="btn btn-primary mt-3"
                        onClick={() => navigate("/addresses/create")}
                    >
                        Añadir dirección
                    </button>
                </div>
            ) : (
                <>
                    <div className="list-group mb-4">
                        {addresses.map((a) => (
                            <label
                                key={a.id}
                                className={`list-group-item d-flex gap-3 align-items-start ${selected === a.id ? "border-primary" : ""}`}
                                style={{ cursor: "pointer" }}
                            >
                                <input
                                    type="radio"
                                    className="form-check-input mt-1"
                                    checked={selected === a.id}
                                    onChange={() => setSelected(a.id)}
                                />

                                <div>
                                    <div className="fw-bold">{a.nombre}</div>
                                    <div className="text-muted small">
                                        {a.direccion}<br />
                                        {a.ciudad}, {a.provincia} {a.codigo_postal}
                                        {a.telefono && (
                                            <>
                                                <br />Tel: {a.telefono}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                    <button
                        className="btn btn-success btn-lg w-100"
                        onClick={handleContinue}
                    >
                        Continuar al pago →
                    </button>
                </>
            )}

        </div>
    );

}
