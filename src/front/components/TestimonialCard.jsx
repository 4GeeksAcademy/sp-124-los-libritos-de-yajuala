import React from "react";

/**
 * Tarjeta de testimonio de usuario.
 * Reutilizable en Home, página "Sobre nosotros", landing pages, etc.
 */
const TestimonialCard = ({ name, role, stars, text }) => {
  // Generamos la inicial del nombre para el avatar
  const inicial = name ? name[0].toUpperCase() : "?";

  return (
    <div className="bk-testimonial">
      {/* Estrellas de valoración */}
      <div className="bk-testimonial-stars">{stars}</div>

      {/* Texto*/}
      <p className="bk-testimonial-text">"{text}"</p>

      {/* Usuario/Autor del comentario*/}
      <div className="bk-testimonial-author">
        <div className="bk-testimonial-avatar">{inicial}</div>
        <div>
          <div className="bk-testimonial-name">{name}</div>
          <div className="bk-testimonial-role">{role}</div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
