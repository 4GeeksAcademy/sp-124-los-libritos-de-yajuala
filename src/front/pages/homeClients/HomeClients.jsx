import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";

// Paleta de colores para portadas sin imagen (igual que BookCoverFallback)
const COVER_COLORS = [
    ["#1d3557", "#457b9d"],
    ["#e63946", "#c1121f"],
    ["#f4a261", "#e76f51"],
    ["#2a9d8f", "#1a7a6e"],
    ["#457b9d", "#1d3557"],
    ["#6d4c41", "#4e342e"],
    ["#5c6bc0", "#3949ab"],
    ["#558b2f", "#33691e"],
];

const CoverPlaceholder = ({ title, index }) => {
    const [from, to] = COVER_COLORS[index % COVER_COLORS.length];
    const initials = title ? title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() : "?";
    return (
        <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(135deg, ${from}, ${to})`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "8px",
        }}>
            <span style={{ fontSize: "32px", opacity: 0.4 }}>📖</span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 700, letterSpacing: "1px" }}>
                {initials}
            </span>
        </div>
    );
};

export default function HomeClients() {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [addingId, setAddingId] = useState(null); // id del libro que se está añadiendo

    const addToCart = async (book) => {
        setAddingId(book.id);
        try {
            const resCart = await fetch(`${backendUrl}/api/clients/${store.user.id}/carts/active`);
            const dataCart = await resCart.json();

            let cartId = null;

            if (!dataCart.active) {
                const resNew = await fetch(`${backendUrl}/api/carts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_cliente: store.user.id, monto_total: 0, estado: "pendiente" }),
                });
                const newCart = await resNew.json();
                cartId = newCart.id;
            } else {
                cartId = dataCart.cart.id;
            }

            const provider_book_id = book?.proveedores?.[0]?.provider_book_id;
            if (!provider_book_id) {
                alert("Este libro no tiene inventario disponible");
                return;
            }

            const resAdd = await fetch(`${backendUrl}/api/cart-books`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_carrito: cartId,
                    id_libro: book.id,
                    provider_book_id,
                    cantidad: 1,
                    precio: book.precio,
                }),
            });
            const dataAdd = await resAdd.json();
            if (!resAdd.ok) { alert(dataAdd.msg || "Error al añadir al carrito"); return; }

            // Feedback visual sin alert
            setBooks((prev) => prev.map((b) => b.id === book.id ? { ...b, _added: true } : b));
            setTimeout(() => {
                setBooks((prev) => prev.map((b) => b.id === book.id ? { ...b, _added: false } : b));
            }, 2000);

        } catch (err) {
            console.error(err);
            alert("Error inesperado");
        } finally {
            setAddingId(null);
        }
    };

    useEffect(() => {
        if (!store.user) { navigate("/login"); return; }
        fetch(`${backendUrl}/api/books`)
            .then((r) => r.json())
            .then((data) => setBooks(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [store.user]);

    const filtered = books.filter((b) =>
        b.titulo?.toLowerCase().includes(search.toLowerCase()) ||
        b.autor?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="cl-page"><div className="cl-loader">Cargando libros</div></div>;

    return (
        <div className="cl-page cl-page-wide">

            {/* Cabecera */}
            <div className="cl-page-header">
                <div className="cl-page-header-left">
                    <h1 className="cl-title">Hola, {store.user?.name || store.user?.email} 👋</h1>
                    <p className="cl-subtitle">{books.length} libros disponibles para ti</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button className="cl-btn cl-btn-ghost" onClick={() => navigate("/user/cart")}>
                        🛒 Mi carrito
                    </button>
                    <button className="cl-btn cl-btn-primary" onClick={() => navigate("/user")}>
                        Mi cuenta
                    </button>
                </div>
            </div>

            {/* Buscador */}
            <div style={{ marginBottom: "28px" }}>
                <input
                    className="cl-input"
                    style={{ maxWidth: "420px" }}
                    placeholder="🔍  Buscar por título o autor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid de libros */}
            {filtered.length === 0 ? (
                <div className="cl-empty">
                    <div className="cl-empty-icon">📚</div>
                    <p className="cl-empty-title">Sin resultados</p>
                    <p className="cl-empty-text">No hay libros que coincidan con tu búsqueda.</p>
                </div>
            ) : (
                <div className="cl-books-grid">
                    {filtered.map((book, index) => (
                        <div key={book.id} className="cl-book-card">

                            {/* Portada */}
                            <div
                                className="cl-book-cover"
                                onClick={() => navigate(`/books/${book.id}`)}
                                style={{ cursor: "pointer" }}
                            >
                                {book.portada ? (
                                    <img src={book.portada} alt={book.titulo} />
                                ) : (
                                    <CoverPlaceholder title={book.titulo} index={index} />
                                )}
                                <span className="cl-book-price-badge">{book.precio} €</span>
                            </div>

                            {/* Info */}
                            <div className="cl-book-info" onClick={() => navigate(`/books/${book.id}`)} style={{ cursor: "pointer" }}>
                                <h3 className="cl-book-title">{book.titulo}</h3>
                                <p className="cl-book-author">{book.autor}</p>
                            </div>

                            {/* Acciones */}
                            <div className="cl-book-actions">
                                <button
                                    className={`cl-btn cl-btn-sm ${book._added ? "cl-btn-success" : "cl-btn-accent"}`}
                                    style={{ flex: 1, justifyContent: "center" }}
                                    onClick={() => addToCart(book)}
                                    disabled={addingId === book.id}
                                >
                                    {book._added ? "✓ Añadido" : addingId === book.id ? "..." : "🛒 Añadir"}
                                </button>
                                <button
                                    className="cl-btn cl-btn-ghost cl-btn-sm"
                                    onClick={() => navigate(`/books/${book.id}`)}
                                >
                                    Ver más
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
