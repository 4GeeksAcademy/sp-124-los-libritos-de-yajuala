import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminCategoriesList() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/categorias`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const deleteCategory = async (id) => {
    if (!confirm("¿Eliminar categoría?")) return;

    const resp = await fetch(`${backendUrl}/api/categorias/${id}`, {
      method: "DELETE"
    });

    if (resp.ok) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div>
      <h1>Categorías</h1>

      <Link to="/admin/categories/create" className="btn btn-primary mb-3">
        Crear Categoría
      </Link>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {categories.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>
                <Link to={`/admin/categories/${c.id}`} className="btn btn-info btn-sm me-2">Ver</Link>
                <Link to={`/admin/categories/${c.id}/edit`} className="btn btn-warning btn-sm me-2">Editar</Link>
                <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(c.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
