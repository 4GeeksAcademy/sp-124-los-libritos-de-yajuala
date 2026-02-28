import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminRepartidoresPendientes() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [pendientes, setPendientes] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarPendientes = async () => {
        try {
            const resp = await fetch(`${backendUrl}/api/repartidores/pendientes`);
            const data = await resp.json();
            setPendientes(data);
        } catch (err) {
            console.error("Error cargando repartidores pendientes:", err);
        } finally {
            setLoading(false);
        }
    };

    const aprobarRepartidor = async (id) => {
        try {
            const resp = await fetch(`${backendUrl}/api/repartidores/${id}/aprobar`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });

            const data = await resp.json();

            if (!resp.ok) {
                alert(data.msg || "Error al aprobar repartidor");
                return;
            }

            alert("Repartidor aprobado correctamente");

            window.dispatchEvent(new Event("repartidorAprobado"));

            cargarPendientes();
        } catch (err) {
            console.error("Error aprobando repartidor:", err);
        }
    };


    useEffect(() => {
        cargarPendientes();
    }, []);

    if (loading) return <p>Cargando repartidores pendientes...</p>;

    return (
        <div className="container mt-4">
            <h2>Repartidores pendientes de aprobación</h2>

            {pendientes.length === 0 ? (
                <p>No hay repartidores pendientes.</p>
            ) : (
                <div className="list-group mt-3">
                    {pendientes.map((rep) => (
                        <div
                            key={rep.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <strong>{rep.name} {rep.lastname}</strong>
                                <div>{rep.email}</div>
                                <div>ID: {rep.id}</div>
                            </div>

                            <button
                                className="btn btn-success"
                                onClick={() => aprobarRepartidor(rep.id)}
                            >
                                Aprobar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}