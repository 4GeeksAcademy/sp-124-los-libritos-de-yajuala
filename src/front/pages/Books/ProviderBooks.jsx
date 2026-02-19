import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ProviderPanelButtons } from "../proveedores/ProviderPanelButtons";

export const ProviderBooks = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { store } = useGlobalReducer();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const isProvider = store.user?.role === "provider";

  const getMyBooks = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/provider/books`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error cargando mis libros (${resp.status})`);
        return;
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      alert("Error de red");
    }
  };

  const deleteProviderBook = async (providerBookId) => {
    try {
      const resp = await fetch(
        `${backendUrl}/api/provider/books/${providerBookId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
        }
      );

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || `Error eliminando (${resp.status})`);
        return;
      }

      getMyBooks();
    } catch (error) {
      alert("Error de red");
    }
  };

  const editQuantity = async (providerBookId, currentQty) => {
    const nuevaCantidad = prompt("Nueva cantidad:", currentQty);

    if (nuevaCantidad === null) return;
    if (isNaN(nuevaCantidad)) {
      alert("Cantidad inválida");
      return;
    }

    try {
      const resp = await fetch(
        `${backendUrl}/api/provider/books/${providerBookId}/cantidad`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.token}`,
          },
          body: JSON.stringify({ cantidad: parseInt(nuevaCantidad) }),
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        alert(data?.msg || "Error actualizando cantidad");
        return;
      }

      alert("Cantidad actualizada");
      getMyBooks();
    } catch (error) {
      alert("Error de red");
    }
  };

  useEffect(() => {
    if (isProvider) getMyBooks();
  }, [isProvider]);

  if (!isProvider) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          No autorizado (solo proveedor).
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <ProviderPanelButtons />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Mis libros (Proveedor)</h1>

        <button
          className="btn btn-warning"
          onClick={() => navigate("/provider/books/new")}
        >
          Crear libro
        </button>
      </div>

      <div className="row">
        {items.length === 0 ? (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-secondary">
              <div className="card-body">
                <h5 className="card-title text-muted">Sin libros</h5>
                <p className="card-text text-muted">
                  Aún no has creado libros
                </p>
              </div>
            </div>
          </div>
        ) : (
          items.map((row) => {
            const book = row.libro;
            if (!book) return null;

            return (
              <div key={row.id} className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{book.titulo}</h5>

                    <p className="card-text mb-1">
                      <strong>Autor:</strong> {book.autor}
                    </p>

                    <p className="card-text">
                      <strong>Precio:</strong> {book.precio} €
                    </p>

                    <p className="card-text">
                      <strong>ISBN:</strong> {book.isbn}
                    </p>

                    <p className="card-text">
                      <strong>Cantidad:</strong> {row.cantidad}
                    </p>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => navigate(`/provider/books/${row.id}`)}
                      >
                        Ver ficha
                      </button>

                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() =>
                          editQuantity(row.id, row.cantidad)
                        }
                      >
                        Editar cantidad
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteProviderBook(row.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
