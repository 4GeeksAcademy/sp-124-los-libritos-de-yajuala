import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const ViewCategorias = () => {
    const { categoriaId } = useParams();
    const navigate = useNavigate();

    const [categoria, setCategoria] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(API_BASE + `/api/categorias/${categoriaId}`)
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar categoría");
                return res.json();
            })
            .then(data => {
                setCategoria(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [categoriaId]);

    if (loading) return <p>Cargando categorías...</p>;
    if (!categoria) return <p>Categorías no encontrada</p>;

    return (
        <div className="container mt-4">
            <h1>Detalle de la Categoría</h1>

            <ul className="list-group mt-3">
                <li className="list-group-item">
                    <strong>ID:</strong> {categoria.id}
                </li>
                <li className="list-group-item">
                    <strong>Nombre:</strong> {categoria.nombre}
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
                    onClick={() => navigate(`/categorias/${categoria.id}`)}
                >
                    Editar
                </button>
            </div>
        </div>
    );
};

export default ViewCategorias;
