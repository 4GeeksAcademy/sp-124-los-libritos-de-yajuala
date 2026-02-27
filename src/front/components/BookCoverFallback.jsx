import React from "react";

// Paleta de colores para generar portadas cuando no hay imagen disponible
const BOOK_COLORS = [
    ["#e63946", "#c1121f"],
    ["#457b9d", "#1d3557"],
    ["#f4a261", "#e76f51"],
    ["#2a9d8f", "#264653"],
    ["#8338ec", "#5e2ca5"],
    ["#fb8500", "#e67e00"],
    ["#06d6a0", "#028a6b"],
    ["#ef476f", "#c2185b"],
];

//Componente que se usa cuando un libro no tiene URL de imagen (campo "portada" vacío o roto).

const BookCoverFallback = ({ title, colorIdx = 0, height = 180 }) => {
    const [c1, c2] = BOOK_COLORS[colorIdx % BOOK_COLORS.length];

    return (
        <div
            style={{
                width: "100%",
                height,
                background: `linear-gradient(145deg, ${c1}, ${c2})`,
                borderRadius: "2px 6px 6px 2px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                padding: "8px",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    left: 0, top: 0, bottom: 0,
                    width: "8px",
                    background: "rgba(0,0,0,0.2)",
                }}
            />
            <span
                style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.3,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {title}
            </span>
        </div>
    );
};
export { BOOK_COLORS };
export default BookCoverFallback;
