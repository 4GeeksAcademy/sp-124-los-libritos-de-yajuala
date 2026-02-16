import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function AdminCategoryDetail() {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [category, setCategory] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/categorias/${id}`)
      .then(res => res.json())
      .then(data => setCategory(data));
  }, []);

  if (!category) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Categoría #{category.id}</h1>

      <p><b>Nombre:</b> {category.nombre}</p>
      <p><b>Descripción:</b> {category.descripcion}</p>

      <Link to={`/admin/categories/${id}/edit`} className="btn btn-warning me-2">
        Editar
      </Link>
    </div>
  );
}
