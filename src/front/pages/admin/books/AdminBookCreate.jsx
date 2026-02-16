import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminBookCreate() {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const token = localStorage.getItem("token");

    const [form, setForm] = useState({
        titulo: "",
        autor: "",
        isbn: "",
        precio: "",
        provider_id: "" 
    });

    const [categorias, setCategorias] = useState([]);
    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
    const [providers, setProviders] = useState([]); 

    useEffect(() => {
        fetch(`${backendUrl}/api/categorias`)
            .then(res => res.json())
            .then(data => setCategorias(data));
    }, []);

    useEffect(() => {
        fetch(`${backendUrl}/api/provider`)
            .then(res => res.json())
            .then(data => setProviders(data));
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCategorias = e => {
        const values = [...e.target.options]
            .filter(o => o.selected)
            .map(o => parseInt(o.value));
        setCategoriasSeleccionadas(values);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const resp = await fetch(`${backendUrl}/api/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(form)
        });

        if (!resp.ok) return alert("Error creando libro");

        const libro = await resp.json();

        await fetch(`${backendUrl}/api/libros/${libro.book.id}/categorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categorias: categoriasSeleccionadas })
        });

        navigate("/admin/books");
    };

    return (
        <div>
            <h1>Crear Libro</h1>

            <form onSubmit={handleSubmit} className="col-6">

                <input className="form-control mb-2" name="titulo" placeholder="Título" onChange={handleChange} />
                <input className="form-control mb-2" name="autor" placeholder="Autor" onChange={handleChange} />
                <input className="form-control mb-2" name="isbn" placeholder="ISBN" onChange={handleChange} />
                <input className="form-control mb-2" name="precio" placeholder="Precio" onChange={handleChange} />

                <label>Proveedor</label>
                <select
                    className="form-control mb-3"
                    name="provider_id"
                    value={form.provider_id}
                    onChange={handleChange}
                >
                    <option value="">Seleccione un proveedor</option>
                    {providers.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.nombre} ({p.email})
                        </option>
                    ))}
                </select>

                <label>Categorías</label>
                <select multiple className="form-control mb-3" onChange={handleCategorias}>
                    {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                </select>

                <button className="btn btn-success">Crear</button>
            </form>
        </div>
    );
}
