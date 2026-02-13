import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const ProviderBookDetail = () => {
  const [row, setRow] = useState(null); // row = provider_book {id, cantidad, libro:{...}}
  const { id } = useParams(); // ESTE id es el provider_book_id
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const role = store.user?.role;
  const isProvider = role === "provider";

  const getMyProviderBook = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/provider/books/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || "Error cargando libro del proveedor");
        navigate("/provider/books");
        return;
      }

      setRow(data);
    } catch (e) {
      alert("Error de red");
      navigate("/provider/books");
    }
  };

  useEffect(() => {
    if (!store.token) {
      navigate("/login/provider");
      return;
    }
    if (!isProvider) {
      navigate("/login/provider");
      return;
    }
    getMyProviderBook();
  }, [id, store.token, isProvider]);

  if (!row) return <div className="container mt-5">Cargando...</div>;

  const book = row.libro;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Ficha del libro (Proveedor)</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/provider/books")}>
          Volver
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <p><strong>Título:</strong> {book?.titulo}</p>
          <p><strong>Autor:</strong> {book?.autor}</p>
          <p><strong>Precio:</strong> {book?.precio} €</p>
          <p><strong>ISBN:</strong> {book?.isbn}</p>
          <p><strong>Cantidad:</strong> {row?.cantidad}</p>

          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate("/provider/books")}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
