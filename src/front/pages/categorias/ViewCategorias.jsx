import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const ViewCategorias = () => {
    const { categoriaId } = useParams();
    const navigate = useNavigate();

    const [categoria, setCategoria] = useState({
        nombre: "",
        descripcion: ""
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false); // Estado para editar

    // Cargar categoría
    useEffect(() => {
        if (!categoriaId) return;

        const fetchCategoria = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/categorias/${categoriaId}`);
                const text = await res.text();

                if (!res.ok) {
                    let msg = "Error al cargar categoría";
                    try {
                        msg = JSON.parse(text).msg || msg;
                    } catch { }
                    throw new Error(msg);
                }

                const data = JSON.parse(text);
                setCategoria({
                    nombre: data.nombre || "",
                    descripcion: data.descripcion || ""
                });

            } catch (err) {
                console.error(err);
                alert(err.message || "No se pudo cargar la categoría");
            } finally {
                setLoading(false);
            }
        };

        fetchCategoria();
    }, [categoriaId]);

    // Manejar cambios de inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoria(prev => ({ ...prev, [name]: value }));
    };

    // Guardar cambios (PUT)
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_BASE}/api/categorias/${categoriaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(categoria)
            });

            const text = await res.text();
            if (!res.ok) {
                let msg = "Error al actualizar categoría";
                try { msg = JSON.parse(text).msg || msg; } catch { }
                throw new Error(msg);
            }

            alert("Categoría actualizada correctamente");
            setEditing(false);

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    if (loading) return <p>Cargando categoría...</p>;

    return (
        <div className="container mt-4">
            <h1>{editing ? "Editar Categoría" : "Detalle de la Categoría"}</h1>

            <form onSubmit={handleUpdate} className="mt-3">
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={categoria.nombre}
                        onChange={handleChange}
                        className="form-control"
                        disabled={!editing}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={categoria.descripcion}
                        onChange={handleChange}
                        className="form-control"
                        rows={3}
                        disabled={!editing}
                        required
                    />
                </div>

                <div className="mt-3">
                    {!editing ? (
                        <button
                            type="button"
                            className="btn btn-warning me-2"
                            onClick={() => setEditing(true)}
                        >
                            Editar
                        </button>
                    ) : (
                        <>
                            <button type="submit" className="btn btn-success me-2">
                                Actualizar
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setEditing(false)}
                            >
                                Cancelar
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => navigate(-1)}
                    >
                        Volver
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ViewCategorias;
