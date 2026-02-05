import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const CategoriasLibro = () => {
    const [categoriasLibro, setCategoriasLibro] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetch(API_BASE + "/api/categorialibro")
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar relaciones");
                return res.json();
            })
            .then(data => {
                setCategoriasLibro(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Eliminar relación categoría-libro
    const deleteRelacion = async (categoria_id, libro_id) => {
        const confirmDelete = confirm("¿Seguro que quieres eliminar esta relación?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(API_BASE + `/api/categorialibro/${categoria_id}/${libro_id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Error al eliminar relación");

            setCategoriasLibro(categoriasLibro.filter(
                cl => !(cl.categoria_id === categoria_id && cl.libro_id === libro_id)
            ));
        } catch (err) {
            console.error(err);
        }
    };

    // Filtrado por buscador (por nombre de categoría o título del libro)
    const filteredCategoriasLibro = categoriasLibro.filter(cl =>
        cl.categoria?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        cl.libro?.titulo.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p>Cargando relaciones...</p>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center">
                <h1>Listado de Categorías-Libro</h1>

                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/categorialibro/new")}
                >
                    + Nueva Relación
                </button>
            </div>

            {/* Buscador */}
            <input
                type="text"
                className="form-control mt-3"
                placeholder="Buscar por categoría o libro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {filteredCategoriasLibro.length === 0 ? (
                <p className="mt-3">No hay relaciones que coincidan</p>
            ) : (
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>ID Categoría</th>
                            <th>Nombre Categoría</th>
                            <th>ID Libro</th>
                            <th>Título Libro</th>
                            <th style={{ width: "180px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategoriasLibro.map(cl => (
                            <tr key={`${cl.categoria_id}-${cl.libro_id}`}>
                                <td>{cl.categoria_id}</td>
                                <td>{cl.categoria?.nombre || "-"}</td>
                                <td>{cl.libro_id}</td>
                                <td>{cl.libro?.titulo || "-"}</td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => navigate(`/categorialibro/${cl.categoria_id}/${cl.libro_id}`)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-info btn-sm me-2"
                                        onClick={() => navigate(`/categorialibro/${cl.categoria_id}/${cl.libro_id}`)}
                                    >
                                        Ver
                                    </button>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteRelacion(cl.categoria_id, cl.libro_id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CategoriasLibro;
