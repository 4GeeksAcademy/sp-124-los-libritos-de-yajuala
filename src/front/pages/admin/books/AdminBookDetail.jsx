import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function AdminBookDetail() {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [book, setBook] = useState(null);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/books/${id}`)
      .then(res => res.json())
      .then(data => setBook(data));

    fetch(`${backendUrl}/api/libros/${id}/categorias`)
      .then(res => res.json())
      .then(data => setCategorias(data));
  }, []);

  if (!book) return <p>Cargando...</p>;

  const proveedor = book.proveedores?.[0];

  return (
    <div>
      <h1>Libro #{book.id}</h1>

      <p><b>Título:</b> {book.titulo}</p>
      <p><b>Autor:</b> {book.autor}</p>
      <p><b>ISBN:</b> {book.isbn}</p>
      <p><b>Precio:</b> {book.precio} €</p>

      <p><b>Proveedor:</b></p>
      {proveedor ? (
        <p>
{proveedor.nombre}
          {proveedor.stock !== undefined && ` (stock: ${proveedor.stock})`}
        </p>
      ) : (
        <p>—</p>
      )}

      <h3>Categorías</h3>
      <ul>
        {categorias.map(cat => (
          <li key={cat.id}>{cat.nombre}</li>
        ))}
      </ul>

      <Link to={`/admin/books/${id}/edit`} className="btn btn-warning me-2">
        Editar
      </Link>
    </div>
  );
}
