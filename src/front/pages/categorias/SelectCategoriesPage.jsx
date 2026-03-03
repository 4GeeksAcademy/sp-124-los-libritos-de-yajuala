import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function SelectCategoriesPage() {
    const { store } = useGlobalReducer();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        fetch(`${backendUrl}/api/categorias`)
            .then(res => res.json())
            .then(data => setCategories(data));

        fetch(`${backendUrl}/api/users/${store.user.id}/favorite-categories`)
            .then(res => res.json())
            .then(data => {
                const ids = data.map(c => Number(c.id)).filter(id => !isNaN(id));
                setSelected(ids);
            });
    }, []);


    const toggleCategory = (id) => {
        id = Number(id);

        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };


    const saveFavorites = async () => {
        await fetch(`${backendUrl}/api/users/${store.user.id}/favorite-categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categories: selected })
        });
        setSelected([]);
        navigate("/user/favorite-categories");
    };

    return (
        <div className="container mt-4">
            <h2>Elegir categorías</h2>
            <p>Selecciona tus categorías favoritas:</p>

            <div className="d-flex flex-wrap gap-3 mt-3">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`btn ${selected.includes(cat.id) ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => toggleCategory(cat.id)}
                    >
                        {cat.nombre}
                    </button>
                ))}
            </div>

            <button className="btn btn-success mt-4" onClick={saveFavorites}>
                Guardar
            </button>
        </div>
    );
}
