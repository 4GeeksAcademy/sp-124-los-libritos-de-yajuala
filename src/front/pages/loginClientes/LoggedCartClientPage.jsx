import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function LoggedCartClientPage() {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [carritos, setCarritos] = useState([]);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (!store.user) {
            navigate("/login");
            return;
        }

        fetch(`${backendUrl}/api/usuarios/${store.user.id}/carritos`)
            .then((res) => res.json())
            .then((data) => setCarritos(data))
            .catch((err) => console.error(err));
    }, [store.user]);

    return (
        <div className="container mt-4">
            <h1>Historial de pedidos</h1>

            {carritos.length === 0 ? (
                <p>No tienes pedidos todavía.</p>
            ) : (
                <ul className="list-group mt-3">
                    {carritos.map((c) => (
                        <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                Pedido #{c.id} — Estado: {c.estado} — Total: {c.monto_total}€
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/carts/${c.id}`)}
                            >
                                Ver detalle
                            </button>
                        </li>
                    ))}
                </ul>

            )}

            <button className="btn btn-secondary mt-3" onClick={() => navigate("/user")}>
                Volver a mi cuenta
            </button>
        </div>
    );
}
