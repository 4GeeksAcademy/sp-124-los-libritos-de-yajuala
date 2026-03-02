import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";


export default function DeliveryHistory() {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!store.token) {
            navigate("/login/delivery");
            return;
        }
        if (store.user?.role !== "delivery") {
            navigate("/login/delivery");
            return;
        }

        fetch(`${backendUrl}/api/delivery/orders/history`, {
            headers: {
                Authorization: `Bearer ${store.token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setHistory(data);
                } else {
                    console.error("Respuesta inesperada del backend:", data);
                    setHistory([]);
                }
            })

            .finally(() => setLoading(false));
    }, [store.token, store.user]);

    if (loading) {
        return <div className="container mt-4">Cargando historial...</div>;
    }

    return (
        <div className="container mt-4" style={{ maxWidth: "900px" }}>
            <h2 className="mb-4">Historial de Repartos</h2>

            {history.length === 0 ? (
                <div className="alert alert-info">
                    No tienes repartos entregados aún.
                </div>
            ) : (
                <div className="list-group">
                    {history.map((entry) => (
                        <div key={entry.cart_id} className="list-group-item mb-3 shadow-sm">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-1">Pedido #{entry.cart_id}</h5>
                                <span className="badge bg-success">Entregado</span>
                            </div>

                            <p className="mb-1">
                                <strong>Fecha de entrega:</strong>{" "}
                                {entry.fecha_entrega
                                    ? new Date(entry.fecha_entrega).toLocaleString()
                                    : "—"}
                            </p>

                            {entry.direccion_entrega && (
                                <div className="mb-2">
                                    <p className="mb-1"><strong>Dirección:</strong> {entry.direccion_entrega.direccion}</p>
                                    <p className="mb-1"><strong>Ciudad:</strong> {entry.direccion_entrega.ciudad}</p>
                                    <p className="mb-1"><strong>Provincia:</strong> {entry.direccion_entrega.provincia}</p>
                                    <p className="mb-1"><strong>Código postal:</strong> {entry.direccion_entrega.codigo_postal}</p>
                                    {entry.direccion_entrega.telefono && (
                                        <p className="mb-1"><strong>Teléfono:</strong> {entry.direccion_entrega.telefono}</p>
                                    )}
                                </div>
                            )}


                            <p className="mb-1">
                                <strong>Cliente:</strong> {entry.cliente?.nombre} (
                                {entry.cliente?.email})
                            </p>

                            <p className="mb-2">
                                <strong>Monto total:</strong> €{entry.monto_total.toFixed(2)}
                            </p>

                            <div className="mt-3">
                                <strong>Libros entregados:</strong>
                                <ul className="mt-2">
                                    {entry.items.map((item, index) => (
                                        <li key={index}>
                                            {item.titulo} — {item.cantidad} × €{item.precio}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                className="btn mt-4"
                style={{ backgroundColor: "#457b9d", borderColor: "#457b9d", color: "white" }}
                onClick={() => navigate("/delivery/me")}
            >
                Volver al panel
            </button>
        </div>
    );
}
