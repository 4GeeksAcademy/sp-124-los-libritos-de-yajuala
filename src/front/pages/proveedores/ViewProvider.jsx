import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const ViewProvider = () => {
    const { providerId } = useParams();
    const navigate = useNavigate();

    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(API_BASE + `/api/provider/${providerId}`)
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar proveedor");
                return res.json();
            })
            .then(data => {
                setProvider(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [providerId]);

    if (loading) return <p>Cargando proveedor...</p>;
    if (!provider) return <p>Proveedor no encontrado</p>;

    return (
        <div className="container mt-4">
            <h1>Detalle del Proveedor</h1>

            <ul className="list-group mt-3">
                <li className="list-group-item">
                    <strong>ID:</strong> {provider.id}
                </li>
                <li className="list-group-item">
                    <strong>Nombre:</strong> {provider.nombre}
                </li>
                <li className="list-group-item">
                    <strong>Email:</strong> {provider.email}
                </li>
                <li className="list-group-item">
                    <strong>Teléfono:</strong> {provider.telefono}
                </li>
                <li className="list-group-item">
                    <strong>Documento:</strong> {provider.documento}
                </li>
            </ul>

            <div className="mt-4">
                <button
                    className="btn btn-secondary me-2"
                    onClick={() => navigate(-1)}
                >
                    Volver
                </button>

                <button
                    className="btn btn-warning"
                    onClick={() => navigate(`/provider/${provider.id}`)}
                >
                    Editar
                </button>
            </div>
        </div>
    );
};

export default ViewProvider;
