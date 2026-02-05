import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const AddCategoria = () => {
    const { categoriaId } = useParams(); // si existe => editar
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [categoria, setCategoria] = useState({
        nombre: ""
    });

    const isEdit = Boolean(categoriaId);

    // Cargar datos de la categoría si es edición
    useEffect(() => {
        if (!isEdit) return;

        setLoading(true);

        fetch(API_BASE + `/api/categorias/${categoriaId}`)
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar categoría");
                return res.json();
            })
            .then(data => {
                setCategoria({
                    nombre: data.nombre || ""
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [categoriaId, isEdit]);

    // Manejar cambios en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoria({ ...categoria, [name]: value });
    };

    // Crear o actualizar
    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = isEdit ? "PUT" : "POST";
        const url = isEdit
            ? API_BASE + `/api/categorias/${categoriaId}`
            : API_BASE + "/api/categorias";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(categoria)
            });

            if (!res.ok) throw new Error("Error al guardar categoría");

            navigate("/categorias");
        } catch (err) {
            console.error(err);
            alert("Error al guardar la categoría");
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
