import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function AdminProviderDetail() {
    const { id } = useParams();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [provider, setProvider] = useState(null);

    useEffect(() => {
        fetch(`${backendUrl}/api/provider/${id}`)
            .then(res => res.json())
            .then(data => setProvider(data));
    }, []);

    if (!provider) return <p>Cargando...</p>;

    return (
        <div>
            <h1>Proveedor #{provider.id}</h1>

            <p><b>Nombre:</b> {provider.nombre}</p>
            <p><b>Email:</b> {provider.email}</p>
            <p><b>Teléfono:</b> {provider.telefono}</p>
            <p><b>Documento:</b> {provider.documento}</p>

            <Link to={`/admin/providers/${id}/edit`} className="btn btn-warning me-2">
                Editar
            </Link>
        </div>
    );
}
