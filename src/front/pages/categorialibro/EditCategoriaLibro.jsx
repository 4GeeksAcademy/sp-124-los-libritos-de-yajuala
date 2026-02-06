import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const EditCategoriaLibro = () => {
    const { categoriaId, libroId } = useParams();
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [libros, setLibros] = useState([]);

    const [selectedCategoria, setSelectedCategoria] = useState("");
    const [selectedLibro, setSelectedLibro] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [relRes, catRes, bookRes] = await Promise.all([
                    fetch(`${API_BASE}/api/categorialibro/${categoriaId}/${libroId}`),
                    fetch(`${API_BASE}/api/categorias`),
                    fetch(`${API_BASE}/api/books`)
                ]);

                const relText = await relRes.text();
                if (!relRes.ok) throw new Error("Relación no encontrada");

                const relData = JSON.parse(relText);
                setSelectedCategoria(String(relData.categoria_id));
                setSelectedLibro(String(relData.libro_id));

                const catData = await catRes.json();
                const bookData = await bookRes.json();

                setCategorias(catData);
                setLibros(bookData);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoriaId, libroId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(
                `${API_BASE}/api/categorialibro/${categoriaId}/${libroId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        categoria_id: Number(selectedCategoria),
                        libro_id: Number(selectedLibro)
                    })
                }
            );

            const text = await res.text();

            if (!res.ok) {
                let msg = "Error al actualizar la relación";
                try {
                    msg = JSON.parse(text).msg || msg;
                } catch {}
                throw new Error(msg);
            }

            alert("Relación actualizada correctamente");
            navigate("/categorialibro");

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    if (loading) return <p>Cargando relación...</p>;

    return (
        <div className="container mt-4">
            <h1>Editar Relación Categoría-Libro</h1>

            <form onSubmit={handleSubmit} className="mt-3">
                <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select
                        className="form-select"
                        value={selectedCategoria}
                        onChange={(e) => setSelectedCategoria(e.target.value)}
                        required
                    >
                        <option value="">-- Selecciona categoría --</option>
                        {categorias.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Libro</label>
                    <select
                        className="form-select"
                        value={selectedLibro}
                        onChange={(e) => setSelectedLibro(e.target.value)}
                        required
                    >
                        <option value="">-- Selecciona libro --</option>
                        {libros.map(l => (
                            <option key={l.id} value={l.id}>
                                {l.titulo} ({l.autor})
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-warning me-2">
                    Actualizar
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

export default EditCategoriaLibro;
