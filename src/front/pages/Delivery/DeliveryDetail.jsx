import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const DeliveryDetail = () => {
  const [delivery, setDelivery] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  const getDelivery = async () => {
    try {
      const resp = await fetch(`${backendUrl}/api/delivery/${id}`);
      const ct = resp.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await resp.json() : null;

      if (!resp.ok) {
        alert(data?.msg || "Error cargando repartidor");
        navigate("/delivery");
        return;
      }

      setDelivery(data);
    } catch (error) {
      alert("Error de red");
    }
  };

  useEffect(() => {
    getDelivery();
  }, [id]);

  if (!delivery) return <div className="container mt-5">Cargando...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">Ficha del repartidor</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/delivery")}>
          Volver
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <p><strong>Nombre:</strong> {delivery.nombre}</p>
          <p><strong>Apellido:</strong> {delivery.apellido}</p>
          <p><strong>Email:</strong> {delivery.email}</p>
          <p><strong>Identificación:</strong> {delivery.identificacion}</p>

          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/delivery/${delivery.id}/edit`)}
            >
              Editar
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/delivery")}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
