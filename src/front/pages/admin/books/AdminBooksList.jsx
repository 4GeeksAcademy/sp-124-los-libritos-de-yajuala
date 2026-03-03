import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminBooksList() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/books`)
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  const deleteBook = async (id) => {
    if (!confirm("¿Eliminar libro?")) return;

    const resp = await fetch(`${backendUrl}/api/books/${id}`, {
      method: "DELETE"
    });

    if (resp.ok) {
      setBooks(books.filter(b => b.id !== id));
    }
  };

  return (
    <div>
      <h1>Libros</h1>

      <Link to="/admin/books/create" className="btn btn-primary mb-3">Crear Libro</Link>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Precio</th>
            <th>Proveedores</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {books.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.titulo}</td>
              <td>{b.precio} €</td>

              <td>
                {b.proveedores?.length > 0
                  ? b.proveedores.map(p => p.nombre).join(", ")
                  : "—"}
              </td>

              <td>
                <Link to={`/admin/books/${b.id}`} className="btn btn-info btn-sm me-2">Ver</Link>
                <Link to={`/admin/books/${b.id}/edit`} className="btn btn-warning btn-sm me-2">Editar</Link>
                <button className="btn btn-danger btn-sm" onClick={() => deleteBook(b.id)}>Eliminar</button>
              </td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
}
