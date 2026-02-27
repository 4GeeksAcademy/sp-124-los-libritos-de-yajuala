import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function FavoriteCategoriesPage() {
  const { store } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/users/${store.user.id}/favorite-categories`)
      .then(res => res.json())
      .then(data => setFavorites(data));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Categorías favoritas</h2>

      {favorites.length === 0 ? (
        <p className="text-muted">Ninguna categoría favorita guardada.</p>
      ) : (
        <ul className="list-group mt-3">
          {favorites.map(cat => (
            <li key={cat.id} className="list-group-item">
              {cat.nombre}
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn btn-primary mt-4"
        onClick={() => navigate("/user/select-categories")}
      >
        Elegir categorías
      </button>
    </div>
  );
}
