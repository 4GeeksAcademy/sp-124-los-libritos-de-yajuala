import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";

export const ReviewDetail = () => {
    const [review, setReview] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

    const { store } = useGlobalReducer();
    const user = store.user;
    const role = store.user?.role;
    const isAdmin = role === "admin";
    const isProvider = role === "provider";
    const isDelivery = role === "delivery";
    const isClient = role === "client";

    const isOwner = (review) => user && review.id_cliente === user.id;

    const getReview = async () => {
        try {
            const resp = await fetch(`${backendUrl}/api/reviews/${id}`);
            const ct = resp.headers.get("content-type") || "";
            const data = ct.includes("application/json") ? await resp.json() : null;

            if (!resp.ok) {
                alert(data?.msg || "Error cargando review");
                navigate("/reviews");
                return;
            }

            setReview(data);
        } catch (error) {
            alert("Error de red");
        }
    };

    useEffect(() => {
        getReview();
    }, [id]);

    if (!review) return <div className="container mt-5">Cargando...</div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="m-0">Ficha de la review</h1>
                <button className="btn btn-secondary" onClick={() => navigate("/reviews")}>
                    Volver
                </button>
            </div>

            <div className="card">
                <div className="card-body">
                    <p>
                        <strong>ID:</strong> {review.id}
                    </p>
                    <p>
                        <strong>ID Cliente:</strong> {review.id_cliente}
                    </p>
                    <p>
                        <strong>ID Libro:</strong> {review.id_libro}
                    </p>
                    <p>
                        <strong>Puntuación:</strong> {review.puntuacion}/5
                    </p>
                    <p>
                        <strong>Comentario:</strong> {review.comentario || "Sin comentario"}
                    </p>

                    <div className="d-flex gap-2">
                        {(isAdmin || isOwner(review)) && (
                            <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/reviews/${review.id}/edit`)}
                        >
                            Editar
                        </button>
                        )}
                        
                        <button className="btn btn-secondary" onClick={() => navigate("/reviews")}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
