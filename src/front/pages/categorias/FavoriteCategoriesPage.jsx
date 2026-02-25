import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function FavoriteCategoriesPage() {
  const { store } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch(`${backendUrl}/api/users/${store.user.id}/favorite-categories`)
      .then(res => res.json())
      .then(data => setSelected(data));
  }, []);

  const toggleCategory = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(c => c !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const saveFavorites = async () => {
    await fetch(`${backendUrl}/api/users/${store.user.id}/favorite-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: selected })
    });

    alert("Categorías guardadas");
  };

  return (
    <div className="container mt-4">
      <h2>Categorías favoritas</h2>
      <p>Selecciona las categorías que te gustan:</p>

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
        Guardar preferencias
      </button>
    </div>
  );
}