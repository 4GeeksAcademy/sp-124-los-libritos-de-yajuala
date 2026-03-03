import { useEffect, useState } from "react";
import AdminSalesChart from "../../components/AdminSalesChart";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function AdminRecommendations() {
  const { store } = useGlobalReducer();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/admin/book-sales`, {
      headers: { Authorization: `Bearer ${store.token}` }
    })
      .then(res => res.json())
      .then(data => setSales(data));
  }, []);

  const addRecommended = async (bookId) => {
    await fetch(`${backendUrl}/api/admin/recommended/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${store.token}`
      },
      body: JSON.stringify({ book_id: bookId })
    });

    alert("Libro añadido a recomendados");
  };

  return (
    <div>
      <h2>Recomendaciones</h2>

      <AdminSalesChart data={sales} />

      <h3 className="mt-4">Top 5 libros más vendidos</h3>

      <div className="bk-books-grid">
        {sales.slice(0, 5).map(book => (
          <div key={book.id} className="bk-book-card">
            <img src={book.portada} className="bk-book-cover" />

            <div className="bk-book-info">
              <div className="bk-book-name">{book.titulo}</div>
              <div className="bk-book-author">por {book.autor}</div>

              <button
                className="bk-btn bk-btn-primary mt-2"
                onClick={() => addRecommended(book.id)}
              >
                Añadir a recomendados
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
