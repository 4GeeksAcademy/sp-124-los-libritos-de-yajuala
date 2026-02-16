import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");


const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const { store, dispatch } = useGlobalReducer();

    const navigate = useNavigate();

    
    useEffect(() => {
        fetch(API_BASE + "/api/categorias")
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar categorías");
                return res.json();
            })
            .then(data => {
                setCategorias(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    
    const deleteCategoria = async (id) => {
        const confirmDelete = confirm("¿Seguro que quieres eliminar esta categoría?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(API_BASE + `/api/categorias/${id}`, {
                method: "DELETE"
            });

            if (!res.ok) throw new Error("Error al eliminar categoría");

            setCategorias(categorias.filter(c => c.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    
    const filteredCategorias = categorias.filter(categoria =>
        categoria.nombre.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p>Cargando categorías...</p>;

    const role = store.user?.role;
	const isAdmin = role === "admin";
	const isProvider = role === "provider";
	const isDelivery = role === "delivery";
	const isClient = role === "client";


    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center">
                <h1>Listado de Categorías</h1>
            {!isClient && (
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/categorias/new")}
                >
                    + Nueva Categoría
                </button>
            )}
                
            </div>

            {/* Buscador */}
            <input
                type="text"
                className="form-control mt-3"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {filteredCategorias.length === 0 ? (
                <p className="mt-3">No hay categorías que coincidan</p>
            ) : (
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th style={{ width: "160px" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategorias.map(categoria => (
                            <tr key={categoria.id}>
                                <td>{categoria.id}</td>
                                <td>{categoria.nombre}</td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => navigate(`/categorias/view/${categoria.id}`)}
                                    >
                                        Ver
                                    </button>

                                {!isClient && (
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteCategoria(categoria.id)}
                                    >
                                        Eliminar
                                    </button>
                                )}
                                    
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Categorias;
