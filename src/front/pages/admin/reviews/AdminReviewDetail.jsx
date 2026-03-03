import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AdminReviewDetail() {
  const { id } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [review, setReview] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [libro, setLibro] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/reviews/${id}`)
      .then(res => res.json())
      .then(async data => {
        setReview(data);

        const c = await fetch(`${backendUrl}/api/user/${data.id_cliente}`).then(r => r.json());
        setCliente(c);

        const l = await fetch(`${backendUrl}/api/books/${data.id_libro}`).then(r => r.json());
        setLibro(l);
      });
  }, []);

  if (!review) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Review #{review.id}</h1>

      <p><b>Cliente:</b> {cliente ? cliente.email : review.id_cliente}</p>
      <p><b>Libro:</b> {libro ? libro.titulo : review.id_libro}</p>
      <p><b>Puntuación:</b> {review.puntuacion}</p>
      <p><b>Comentario:</b> {review.comentario || "Sin comentario"}</p>
    </div>
  );
}
