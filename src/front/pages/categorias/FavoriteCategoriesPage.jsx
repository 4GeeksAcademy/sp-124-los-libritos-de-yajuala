import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function FavoriteCategoriesPage() {
  const { store } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/users/${store.user.id}/favorite-categories`)
      .then(res => res.json())
      .then(data => setFavorites(data));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Categorías favoritas</h2>
      <p>Estas son las categorías que te han gustado en Swipe:</p>

      {favorites.length === 0 && (
        <div className="alert alert-info mt-3">
          Aún no has marcado ninguna categoría como favorita.
        </div>
      )}

      <ul className="list-group mt-3">
        {favorites.map(cat => (
          <li key={cat.id} className="list-group-item">
            {cat.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}
