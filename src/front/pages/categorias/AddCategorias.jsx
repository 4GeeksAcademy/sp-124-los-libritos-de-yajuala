import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const AddCategoria = () => {
    const { categoriaId } = useParams();
    const navigate = useNavigate();

    const isEdit = Boolean(categoriaId);

    const [loading, setLoading] = useState(false);
    const [categoria, setCategoria] = useState({
        nombre: "",
        descripcion: ""
    });

    // Cargar categoría si es edición
    useEffect(() => {
        if (!isEdit) return;

        const fetchCategoria = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/categorias/${categoriaId}`);
                const text = await res.text();

                if (!res.ok) throw new Error("Error al cargar categoría");

                const data = JSON.parse(text);
                setCategoria({
                    nombre: data.nombre || "",
                    descripcion: data.descripcion || ""
                });

            } catch (err) {
                console.error(err);
                alert("No se pudo cargar la categoría");
            } finally {
                setLoading(false);
            }
        };

        fetchCategoria();
    }, [categoriaId, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoria(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = isEdit ? "PUT" : "POST";
        const url = isEdit
            ? `${API_BASE}/api/categorias/${categoriaId}`
            : `${API_BASE}/api/categorias`;

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre: categoria.nombre,
                    descripcion: categoria.descripcion
                })
            });

            const text = await res.text();

            if (!res.ok) {
                let msg = "Error al guardar categoría";
                try {
                    msg = JSON.parse(text).msg || msg;
                } catch { }
                throw new Error(msg);
            }

            navigate("/categorias");

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    if (loading) return <p>Cargando categoría...</p>;

    return (
        <div className="container mt-4">
            <h1>{isEdit ? "Editar Categoría" : "Nueva Categoría"}</h1>

            <form onSubmit={handleSubmit} className="mt-3">
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={categoria.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                        className="form-control"
                        name="descripcion"
                        value={categoria.descripcion}
                        onChange={handleChange}
                        rows={3}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-success me-2">
                    {isEdit ? "Actualizar" : "Crear"}
                </button>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/categorias")}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default AddCategoria;
