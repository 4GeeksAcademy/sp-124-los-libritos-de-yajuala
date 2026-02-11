import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Delivery = () => {
  const [delivery, setDelivery] = useState([]);
  const navigate = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("token");

  const getDelivery = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/delivery`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (resp.status === 401) {
        alert("Sesión expirada. Inicia sesión nuevamente.");
        navigate("/delivery/login");
        return;
      }

      const data = await resp.json();
      if (resp.ok) setDelivery(data);

    } catch (error) {
      console.error("Error loading delivery", error);
    }
  };

  const deleteDelivery = async (deliveryId) => {
    try {
      const resp = await fetch(`${backendUrl}/api/delivery/${deliveryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || "Error eliminando repartidor");
        return;
      }

      getDelivery();
    } catch (error) {
      alert("Error de red");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/delivery/login");
      return;
    }
    getDelivery();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Repartidores</h1>
        <button className="btn btn-warning" onClick={() => navigate("/delivery/new")}>
          Crear repartidor
        </button>
      </div>

      <div className="row">
        {delivery.length === 0 ? (
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-secondary">
              <div className="card-body">
                <h5 className="card-title text-muted">Sin repartidores</h5>
                <p className="card-text text-muted">Aún no hay repartidores creados</p>
              </div>
            </div>
          </div>
        ) : (
          delivery.map((d) => (
            <div key={d.id} className="col-12 col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{d.nombre} {d.apellido}</h5>
                  <p className="card-text mb-1"><strong>Email:</strong> {d.email}</p>
                  <p className="card-text"><strong>Identificación:</strong> {d.identificacion}</p>

                  <div className="d-flex gap-2">
                    <button className="btn btn-info btn-sm" onClick={() => navigate(`/delivery/${d.id}`)}>Ver ficha</button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/delivery/${d.id}/edit`)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteDelivery(d.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
