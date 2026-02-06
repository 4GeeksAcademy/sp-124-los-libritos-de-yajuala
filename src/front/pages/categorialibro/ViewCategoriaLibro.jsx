import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const ViewCategoriaLibro = () => {
    const { categoriaId, libroId } = useParams(); // Recibimos ambos IDs
    const navigate = useNavigate();

    const [relacion, setRelacion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelacion = async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/api/categorialibro/${categoriaId}/${libroId}`
                );

                const text = await res.text();

                if (!res.ok) {
                    let msg = "Error al cargar relación";

                    try {
                        const json = JSON.parse(text);
                        msg = json.msg || msg;
                    } catch {
                        console.error("Respuesta no JSON:", text);
                    }

                    throw new Error(msg);
                }

                const data = JSON.parse(text);
                setRelacion(data);

            } catch (err) {
                console.error(err);
                setRelacion(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRelacion();
    }, [categoriaId, libroId]);



    if (loading) return <p>Cargando relación...</p>;
    if (!relacion) return <p>Relación no encontrada</p>;

    return (
        <div className="container mt-4">
            <h1>Detalle de la Relación Categoría-Libro</h1>

            <ul className="list-group mt-3">
                <li className="list-group-item">
                    <strong>ID Categoría:</strong> {relacion.categoria_id}
                </li>
                <li className="list-group-item">
                    <strong>Nombre Categoría:</strong> {relacion.categoria?.nombre || "-"}
                </li>
                <li className="list-group-item">
                    <strong>ID Libro:</strong> {relacion.libro_id}
                </li>
                <li className="list-group-item">
                    <strong>Título Libro:</strong> {relacion.libro?.titulo || "-"}
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
                    onClick={() =>
                        navigate(`/categorialibro/edit/${relacion.categoria_id}/${relacion.libro_id}`)
                    }
                >
                    Editar
                </button>
            </div>
        </div>
    );
};

export default ViewCategoriaLibro;
