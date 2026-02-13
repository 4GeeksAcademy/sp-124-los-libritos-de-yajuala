import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function CheckoutAddressPage() {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [addresses, setAddresses] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (!store.user) {
            navigate("/login");
            return;
        }

        fetch(`${backendUrl}/api/users/${store.user.id}/addresses`)
            .then((res) => res.json())
            .then((data) => setAddresses(data))
            .catch((err) => console.error(err));
    }, [store.user]);

    const handleContinue = () => {
        if (!selected) {
            alert("Selecciona una dirección");
            return;
        }

        navigate("/checkout/payment-method", {
            state: { addressId: selected }
        });

    };

    return (
        <div className="container mt-4">
            <h1>Dirección de entrega</h1>

            <button
                className="btn btn-primary mt-3"
                onClick={() => navigate("/addresses/create")}
            >
                Añadir nueva dirección
            </button>

            {addresses.length === 0 ? (
                <p className="mt-3">No tienes direcciones guardadas.</p>
            ) : (
                <>
                    <ul className="list-group mt-3">
                        {addresses.map((a) => (
                            <li
                                key={a.id}
                                className={`list-group-item d-flex justify-content-between align-items-center ${selected === a.id ? "active" : ""
                                    }`}
                                onClick={() => setSelected(a.id)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <input
                                        type="radio"
                                        checked={selected === a.id}
                                        onChange={() => setSelected(a.id)}
                                    />

                                    <div>
                                        <b>{a.nombre}</b>
                                        <div>{a.direccion}</div>
                                        <div>{a.ciudad}, {a.provincia}</div>
                                        <div>{a.codigo_postal}</div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <button className="btn btn-success mt-4" onClick={handleContinue}>
                        Continuar al pago
                    </button>
                </>
            )}
        </div>
    );
}
