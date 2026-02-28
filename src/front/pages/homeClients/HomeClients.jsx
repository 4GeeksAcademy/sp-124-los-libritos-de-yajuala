import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import "../../styles/client.css";

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
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [addingId, setAddingId] = useState(null);

    const addToCart = async (book) => {
        setAddingId(book.id);
        try {
            const providerBookId = book.proveedores?.[0]?.provider_book_id;
            if (!providerBookId) {
                alert("Este libro no tiene inventario disponible");
                return;
            }

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

            const resAdd = await fetch(`${backendUrl}/api/cart-books`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_carrito: cartId,
                    id_libro: book.id,
                    provider_book_id: providerBookId,
                    cantidad: 1,
                    precio: book.precio,
                }),
            });
            const dataAdd = await resAdd.json();
            if (!resAdd.ok) { alert(dataAdd.msg || "Error al añadir al carrito"); return; }

            const resFull = await fetch(`${backendUrl}/api/carts/${cartId}`);
            const fullCart = await resFull.json();
            dispatch({ type: "set_active_cart", payload: fullCart });

            setBooks((prev) => prev.map((b) => b.id === book.id ? { ...b, _added: true } : b));
            setTimeout(() => {
                setBooks((prev) => prev.map((b) => b.id === book.id ? { ...b, _added: false } : b));
            }, 2000);

        } catch (err) {
            console.error("Error añadiendo al carrito:", err);
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
        <div className="container-fluid py-4">

            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h1 className="h3 mb-1">Hola, {store.user?.name || store.user?.email} 👋</h1>
                    <p className="text-muted">{books.length} libros disponibles para ti</p>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => navigate("/user/cart")}>
                        🛒 Mi carrito
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate("/user")}>
                        Mi cuenta
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: "420px" }}
                    placeholder="🔍  Buscar por título o autor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {filtered.length === 0 ? (
                <div className="text-center py-5">
                    <div className="fs-1">📚</div>
                    <h3>Sin resultados</h3>
                    <p className="text-muted">No hay libros que coincidan con tu búsqueda.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {filtered.map((book, index) => (
                        <div key={book.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div className="card h-100 shadow-sm">

                                <div
                                    className="position-relative"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/books/${book.id}`)}
                                >
                                    {book.portada ? (
                                        <img
                                            src={book.portada}
                                            alt={book.titulo}
                                            className="card-img-top"
                                            style={{ height: "260px", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{ height: "260px" }}
                                        >
                                            <CoverPlaceholder title={book.titulo} index={index} />
                                        </div>
                                    )}

                                    <span className="badge bg-primary position-absolute top-0 end-0 m-2">
                                        {book.precio} €
                                    </span>
                                </div>

                                <div
                                    className="card-body"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/books/${book.id}`)}
                                >
                                    <h5 className="card-title">{book.titulo}</h5>
                                    <p className="card-text text-muted">{book.autor}</p>
                                </div>

                                <div className="card-footer bg-white border-0 d-flex gap-2">
                                    <button
                                        className={`btn btn-sm w-100 ${book._added ? "btn-success" : "btn-warning"}`}
                                        onClick={() => addToCart(book)}
                                        disabled={addingId === book.id}
                                    >
                                        {book._added ? "✓ Añadido" : addingId === book.id ? "..." : "🛒 Añadir"}
                                    </button>

                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => navigate(`/books/${book.id}`)}
                                    >
                                        Ver más
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );

}
