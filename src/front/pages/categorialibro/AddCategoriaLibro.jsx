import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const AddCategoriaLibro = () => {
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [libros, setLibros] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState("");
    const [selectedLibro, setSelectedLibro] = useState("");
    const [loading, setLoading] = useState(true);

    // Cargar categorías y libros disponibles
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, bookRes] = await Promise.all([
                    fetch(API_BASE + "/api/categorias"),
                    fetch(API_BASE + "/api/books")
                ]);

                if (!catRes.ok) throw new Error("Error al cargar categorías");
                if (!bookRes.ok) throw new Error("Error al cargar libros");

                const catData = await catRes.json();
                const bookData = await bookRes.json();

                setCategorias(catData);
                setLibros(bookData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCategoria || !selectedLibro) {
            alert("Debes seleccionar categoría y libro");
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE}/api/categorialibro/${selectedCategoria}/${selectedLibro}`,
                {
                    method: "POST",
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || "Error al crear la relación");
            }

            alert("Relación creada correctamente");
            navigate("/categorialibro");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    if (loading) return <p>Cargando categorías y libros...</p>;

    return (
        <div className="container mt-4">
            <h1>Nueva Relación Categoría-Libro</h1>

            <form onSubmit={handleSubmit} className="mt-3">
                <div className="mb-3">
                    <label className="form-label">Selecciona Categoría</label>
                    <select
                        className="form-select"
                        value={selectedCategoria}
                        onChange={(e) => setSelectedCategoria(e.target.value)}
                        required
                    >
                        <option value="">-- Selecciona categoría --</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Selecciona Libro</label>
                    <select
                        className="form-select"
                        value={selectedLibro}
                        onChange={(e) => setSelectedLibro(e.target.value)}
                        required
                    >
                        <option value="">-- Selecciona libro --</option>
                        {libros.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.titulo} ({l.autor})
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Crear Relación
                </button>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/categorialibro")}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default AddCategoriaLibro;
