import React, { useState } from "react";
import BookCoverFallback, { BOOK_COLORS } from "./BookCoverFallback";

//Tarjeta de libro con datos reales de la BD.

const BookCard = ({ book, colorIdx = 0, onBuy, variant = "sale" }) => {
    const [imgError, setImgError] = useState(false);
    const hasImage = book.portada && !imgError;

    // ── Variante horizontal (lista de ofertas, resultados de búsqueda, etc.)
    if (variant === "sale") {
        return (
            <div className="bk-sale-item">
                {/* Portada */}
                <div className="bk-sale-cover">
                    {hasImage ? (
                        <img
                            src={book.portada}
                            alt={book.titulo}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <BookCoverFallback
                            title={book.titulo}
                            colorIdx={colorIdx}
                            height={80}
                        />
                    )}
                </div>

                {/* Información */}
                <div className="bk-sale-info">
                    <div className="bk-sale-title" title={book.titulo}>
                        {book.titulo}
                    </div>

                    <div className="bk-sale-tags">
                        {book.autor && <span>{book.autor}</span>}
                        {book.categorias && book.categorias.length > 0 && (
                            <span> · {book.categorias[0]}</span>
                        )}
                    </div>

                    <div className="bk-sale-price-row">
                        <span className="bk-sale-price">
                            ${typeof book.precio === "number"
                                ? book.precio.toFixed(2)
                                : book.precio}
                        </span>
                    </div>
                </div>
                <button
                    className="bk-sale-buy-btn"
                    onClick={() => onBuy && onBuy(book)}
                >
                    Comprar
                </button>
            </div>
        );
    }

    // ── Variante vertical (grid de libros, recomendados, etc.) ──
    return (
        <div className="bk-book-card" onClick={() => onBuy && onBuy(book)}>
            {hasImage ? (
                <img
                    className="bk-book-cover-img"
                    src={book.portada}
                    alt={book.titulo}
                    onError={() => setImgError(true)}
                />
            ) : (
                <BookCoverFallback
                    title={book.titulo}
                    colorIdx={colorIdx}
                    height={180}
                />
            )}

            <div className="bk-book-info">
                <div className="bk-book-name">{book.titulo}</div>
                <div className="bk-book-author">{book.autor}</div>
                <div className="bk-book-footer">
                    <span className="bk-book-price">
                        ${typeof book.precio === "number"
                            ? book.precio.toFixed(2)
                            : book.precio}
                    </span>
                    {book.categorias && book.categorias.length > 0 && (
                        <span className="bk-stars" style={{ fontSize: 11, color: "#aaa" }}>
                            {book.categorias[0]}
                        </span>
                    )}
                </div>
                <button
                    className="bk-add-btn"
                    onClick={e => {
                        e.stopPropagation();
                        onBuy && onBuy(book);
                    }}
                >
                    🛒 Añadir al carrito
                </button>
            </div>
        </div>
    );
};

export default BookCard;
