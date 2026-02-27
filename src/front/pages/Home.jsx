import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";

// ─── Componentes reutilizables (carpeta components) ───────────────────────────
import BookCoverFallback, { BOOK_COLORS } from "../components/BookCoverFallback";
import BookCard from "../components/BookCard";
import TestimonialCard from "../components/TestimonialCard";

// ─── Datos estáticos del Home ─────────────────────────────────────────────────
const BOOKS_RECOMMENDED = [
  { id: 1, title: "Take Out Tango", author: "A. Lorenz", price: "$9.5", stars: "★★★★☆", colorIdx: 0 },
  { id: 2, title: "The Missadventure", author: "J. Park", price: "$12.0", stars: "★★★★★", colorIdx: 1 },
  { id: 3, title: "Seconds [Part I]", author: "M. Chen", price: "$8.5", stars: "★★★☆☆", colorIdx: 2 },
  { id: 4, title: "Terrible Madness", author: "R. Voss", price: "$11.0", stars: "★★★★☆", colorIdx: 3 },
  { id: 5, title: "Battle Drive", author: "K. Stone", price: "$9.5", stars: "★★★★★", colorIdx: 4 },
  { id: 6, title: "Real Life", author: "T. Walsh", price: "$15.0", stars: "★★★★☆", colorIdx: 5 },
  { id: 7, title: "Heavy Lift", author: "D. Moore", price: "$7.5", stars: "★★★☆☆", colorIdx: 6 },
  { id: 8, title: "Adventure", author: "S. Hill", price: "$18.0", stars: "★★★★★", colorIdx: 7 },
];

const TESTIMONIALS = [
  { name: "Jason Huang", role: "Book Lover", stars: "★★★★★", text: "Very impressive store. Your book made studying for the ABC certification exams a breeze. Thank you very much!" },
  { name: "Miranda Lee", role: "Book Lover", stars: "★★★★☆", text: "Thank you for filling a niche at an affordable price. Your book was just what I was looking for. Thanks again." },
  { name: "Steve Henry", role: "Book Lover", stars: "★★★☆☆", text: "Very impressive store. Your book made studying for the ABC certification exams a breeze. Thank you very much!" },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  // Libros en oferta desde la BD
  const [saleBooks, setSaleBooks] = useState([]);
  const [saleLoading, setSaleLoading] = useState(true);
  const [saleError, setSaleError] = useState(null);

  // Email del newsletter
  const [email, setEmail] = useState("");

  // ── Lógica original ──────────────────────────────────────────────────────────
  const loadMessage = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file");
      const response = await fetch(backendUrl + "/api/hello");
      const data = await response.json();
      if (response.ok) dispatch({ type: "set_hello", payload: data.message });
    } catch (error) {
      console.error("Error al cargar el mensaje:", error);
    }
  };

  // ── Carga los libros desde /api/books ────────────────────────────────────────
  const loadBooks = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined");
      const response = await fetch(`${backendUrl}/api/books`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setSaleBooks(data);
    } catch (error) {
      console.error("Error al cargar los libros:", error);
      setSaleError("No se pudieron cargar los libros. Intenta de nuevo más tarde.");
    } finally {
      setSaleLoading(false);
    }
  };

  useEffect(() => {
    loadMessage();
    loadBooks();
  }, []);

  const user = store.user;
  const role = store.user?.role;
  const isAdmin = role === "admin";
  const isProvider = role === "provider";
  const isDelivery = role === "delivery";
  const isClient = role === "client";

  useEffect(() => {
    if (isAdmin) navigate("/admin/dashboard");
  }, [isAdmin]);

  // Redirige a la vista de libros al pulsar comprar
  const handleBuyBook = () => navigate("/books");

  // ── Renderizado ──────────────────────────────────────────────────────────────
  return (
    <div className="bk-home">

      {/* ── HÉROE ── */}
      <section className="bk-hero">
        <div className="bk-container">
          <div className="bk-hero-content">
            <div className="bk-hero-text">
              <span className="bk-hero-badge">Best Management</span>
              <h1 className="bk-hero-title">Think and<br />Grow Rich</h1>
              <p className="bk-hero-desc">
                Discover thousands of books across every genre. From bestsellers to hidden gems — find your next great read today.
              </p>
              <div className="bk-hero-price">
                <span className="current">$17.20</span>
                <span className="old">$20.00</span>
                <span className="badge-off">15% OFF</span>
              </div>
              <div className="bk-hero-btns">
                <Link to="/books" className="bk-btn bk-btn-primary">🛒 Buy Now</Link>
                <Link to="/books" className="bk-btn bk-btn-outline">See Details</Link>
              </div>
            </div>

            <div className="bk-hero-book">
              <div className="bk-hero-book-cover">
                <div className="bk-hero-book-title">Think and Grow Rich</div>
                <div className="bk-hero-book-author">by Napoleon Hill</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BARRA DE CARACTERÍSTICAS ── */}
      <section className="bk-features-bar">
        <div className="bk-container">
          <div className="bk-features-bar-inner">
            {[
              { icon: <svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, label: "Quick Delivery", desc: "Fast shipping worldwide" },
              { icon: <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>, label: "Secure Payment", desc: "100% protected transactions" },
              { icon: <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>, label: "Best Quality", desc: "Curated premium books" },
              { icon: <svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" /></svg>, label: "Return Guarantee", desc: "Easy 30-day returns" },
            ].map((f, i) => (
              <div className="bk-feature-item" key={i}>
                <div className="bk-feature-icon">{f.icon}</div>
                <div>
                  <div className="bk-feature-label">{f.label}</div>
                  <div className="bk-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACCESO POR ROL / AUTENTICACIÓN ── */}
      {(!user || isProvider || isClient || isDelivery) && (
        <section className="bk-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="bk-container">
            {!user && (
              <div style={{ textAlign: "center" }}>
                <div className="bk-section-head" style={{ marginBottom: 20 }}>
                  <h2>Welcome to Bookland</h2>
                  <p>Sign in or create an account to start your reading journey.</p>
                </div>
                <p style={{ textAlign: "center", marginBottom: 12, color: "#888", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
                  Registro
                </p>
                <div className="bk-role-access">
                  <Link to="/clients/create" className="bk-role-btn primary">Registro Cliente</Link>
                  <Link to="/provider/create" className="bk-role-btn warning">Registro Proveedor</Link>
                  <Link to="/delivery/new" className="bk-role-btn info">Registro Repartidor</Link>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="bk-role-access" style={{ justifyContent: "center" }}>
                <Link to="/admin/dashboard" className="bk-role-btn primary">Panel Admin</Link>
              </div>
            )}

            {(isProvider || isClient) && (
              <div className="bk-role-access" style={{ justifyContent: "center" }}>
                <Link to="/categorialibro" className="bk-role-btn info">Categorías Libros</Link>
                <Link to="/categorias" className="bk-role-btn info">Categorías</Link>
                <button className="bk-role-btn primary" onClick={() => navigate("/books")}>Ir a Libros</button>
                <button className="bk-role-btn success" onClick={() => navigate("/reviews")}>Reviews</button>
              </div>
            )}

            {isDelivery && (
              <div className="bk-role-access" style={{ justifyContent: "center" }}>
                <Link to="/clients" className="bk-role-btn success">Clientes</Link>
                <Link to="/carts" className="bk-role-btn danger">Ver Carritos</Link>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="bk-divider" />

      {/* ── RECOMENDADOS (estáticos) ── */}
      <section className="bk-section bk-section-grey">
        <div className="bk-container">
          <div className="bk-section-head">
            <h2>Recommended For You</h2>
            <p>Handpicked titles based on what readers like you are enjoying right now.</p>
          </div>
          <div className="bk-books-grid">
            {BOOKS_RECOMMENDED.map(b => (
              <div className="bk-book-card" key={b.id} onClick={() => navigate("/books")}>
                {/* Usamos BookCoverFallback directamente porque estos libros son estáticos */}
                <BookCoverFallback title={b.title} colorIdx={b.colorIdx} height={180} />
                <div className="bk-book-info">
                  <div className="bk-book-name">{b.title}</div>
                  <div className="bk-book-author">por {b.author}</div>
                  <div className="bk-book-footer">
                    <span className="bk-book-price">{b.price}</span>
                    <span className="bk-stars">{b.stars}</span>
                  </div>
                  <button className="bk-add-btn" onClick={e => { e.stopPropagation(); navigate("/books"); }}>
                    🛒 Añadir al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIBROS EN OFERTA (desde la BD) ── */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-section-header">
            <h2>Books on Sale</h2>
            <Link to="/books" className="bk-section-link">Ver todos →</Link>
          </div>

          {saleLoading && (
            <div className="bk-sale-loading">⏳ Cargando libros…</div>
          )}

          {saleError && !saleLoading && (
            <div className="bk-sale-error">⚠️ {saleError}</div>
          )}

          {!saleLoading && !saleError && saleBooks.length === 0 && (
            <div className="bk-sale-empty">📭 No hay libros disponibles en este momento.</div>
          )}

          {!saleLoading && !saleError && saleBooks.length > 0 && (
            <div className="bk-sale-grid">
              {saleBooks.map((book, idx) => (
                // BookCard con variant="sale" → tarjeta horizontal compacta
                <BookCard
                  key={book.id}
                  book={book}
                  colorIdx={idx % BOOK_COLORS.length}
                  onBuy={handleBuyBook}
                  variant="sale"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ESTADÍSTICAS ── */}
      <section className="bk-section bk-section-grey">
        <div className="bk-container">
          <div className="bk-stats-grid">
            {[
              { icon: "😊", num: "125,663", label: "Clientes felices" },
              { icon: "📚", num: saleBooks.length > 0 ? saleBooks.length.toLocaleString() : "50,672", label: "Libros disponibles" },
              { icon: "🏪", num: "1,562", label: "Tiendas" },
              { icon: "✍️", num: "457", label: "Autores famosos" },
            ].map((s, i) => (
              <div className="bk-stat-card" key={i}>
                <div className="bk-stat-icon">{s.icon}</div>
                <div className="bk-stat-num">{s.num}</div>
                <div className="bk-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-section-head">
            <h2>Lo que dicen los lectores</h2>
            <p>Miles de amantes de los libros confían en Bookland para sus lecturas.</p>
          </div>
          <div className="bk-testimonials-grid">
            {/* Usamos TestimonialCard para cada testimonio */}
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard
                key={i}
                name={t.name}
                role={t.role}
                stars={t.stars}
                text={t.text}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="bk-newsletter">
        <div className="bk-container">
          <div className="bk-newsletter-inner">
            <div className="bk-newsletter-text">
              <h2>Suscríbete para recibir<br />las últimas novedades</h2>
              <p>Selecciones semanales, ofertas exclusivas y consejos de lectura.</p>
            </div>
            <div className="bk-newsletter-form">
              <input
                className="bk-newsletter-input"
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button className="bk-newsletter-btn">Suscribirse</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCESOS RÁPIDOS (DESARROLLO) ── */}
      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-dev-panel">
            <h4>Accesos rápidos Dev</h4>
            <div className="bk-dev-btns">
              <Link to="/clients" className="bk-dev-btn success">Clientes</Link>
              <Link to="/provider" className="bk-dev-btn warning">Proveedores</Link>
              <Link to="/categorialibro" className="bk-dev-btn info">Categorías Libros</Link>
              <Link to="/categorias" className="bk-dev-btn info">Categorías</Link>
              <Link to="/carts" className="bk-dev-btn danger">Ver Carritos</Link>
              <button className="bk-dev-btn info" onClick={() => navigate("/delivery")}>Repartidores</button>
              <button className="bk-dev-btn primary" onClick={() => navigate("/books")}>Ir a Libros</button>
              <button className="bk-dev-btn success" onClick={() => navigate("/reviews")}>Reviews</button>
              <button className="bk-dev-btn warning" onClick={() => navigate("/provider/books")}>Libros Proveedor</button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
