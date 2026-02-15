import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ProviderPanelButtons } from "../proveedores/ProviderPanelButtons";


export const ProviderOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const { store } = useGlobalReducer();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const load = async () => {
    const resp = await fetch(`${backendUrl}/api/provider/orders`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    const data = await resp.json().catch(() => null);

    if (!resp.ok) {
      alert(data?.msg || "Error cargando pedidos");
      return;
    }
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!store.token) return navigate("/login/provider");
    if (store.user?.role !== "provider") return navigate("/login/provider");
    load();
  }, [store.token]);

  return (
    <div className="container mt-5">
      <ProviderPanelButtons />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Mis pedidos</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/provider/me")}>Volver</button>
      </div>

      {orders.length === 0 ? (
        <div className="alert alert-info">No tienes pedidos pagados todavía.</div>
      ) : (
        orders.map((o) => (
          <div key={o.cart_id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Pedido #{o.cart_id}</h5>
              <p className="mb-1"><strong>Estado:</strong> {o.estado}</p>
              <p className="mb-1"><strong>Fecha:</strong> {o.fecha || "-"}</p>
              <p className="mb-3"><strong>Cliente:</strong> {o.id_cliente}</p>

              {o.items.map((it) => (
                <div key={it.cart_book_id} className="border rounded p-2 mb-2">
                  <div><strong>{it.titulo}</strong> (ISBN: {it.isbn})</div>
                  <div>Cantidad: {it.cantidad}</div>
                  <div>Precio: {it.precio} €</div>
                  <div>Descuento: {(it.descuento || 0) * 100}%</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
