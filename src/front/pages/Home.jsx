import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";

import BookCoverFallback, { BOOK_COLORS } from "../components/BookCoverFallback";
import BookCard from "../components/BookCard";
import TestimonialCard from "../components/TestimonialCard";
import HeroSection from "../components/HeroSection.jsx";
import RecommendedBooks from "../components/RecommendedBooks.jsx";
import LatestBooks from "../components/LatestBooks.jsx";


const TESTIMONIALS = [
  { name: "Jason Huang", role: "Book Lover", stars: "★★★★★", text: "Very impressive store. Your book made studying for the ABC certification exams a breeze. Thank you very much!" },
  { name: "Miranda Lee", role: "Book Lover", stars: "★★★★☆", text: "Thank you for filling a niche at an affordable price. Your book was just what I was looking for. Thanks again." },
  { name: "Steve Henry", role: "Book Lover", stars: "★★★☆☆", text: "Very impressive store. Your book made studying for the ABC certification exams a breeze. Thank you very much!" },
];

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [saleBooks, setSaleBooks] = useState([]);
  const [saleLoading, setSaleLoading] = useState(true);
  const [saleError, setSaleError] = useState(null);

  const [email, setEmail] = useState("");

  const [stats, setStats] = useState({ clients: 0, books: 0, authors: 0 });
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    fetch(`${backendUrl}/api/stats/home`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/reviews/latest`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
        else setReviews([]);
      })
      .catch(() => setReviewsError("No se pudieron cargar los testimonios."))
      .finally(() => setReviewsLoading(false));
  }, []);

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

  const handleBuyBook = () => navigate("/books");

  return (
    <div className="bk-home">

      <HeroSection />
      
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

      {(!user || isProvider || isClient || isDelivery) && (
        <section className="bk-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="bk-container">
            {!user && (
              <div style={{ textAlign: "center" }}>
                <div className="bk-section-head" style={{ marginBottom: 20 }}>
                  <h2>Bienvenido a los Libritos de Yajuala</h2>
                  <p>Reegistrate para continuar con tu aventura de lectura</p>
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

      <RecommendedBooks />
      
      <LatestBooks />
      
      <section className="bk-section bk-section-grey">
        <div className="bk-container">
          <div className="bk-stats-grid">

            <div className="bk-stat-card">
              <div className="bk-stat-icon">😊</div>
              <div className="bk-stat-num">{stats.clients.toLocaleString()}</div>
              <div className="bk-stat-label">Clientes felices</div>
            </div>

            <div className="bk-stat-card">
              <div className="bk-stat-icon">📚</div>
              <div className="bk-stat-num">{stats.books.toLocaleString()}</div>
              <div className="bk-stat-label">Libros disponibles</div>
            </div>

            <div className="bk-stat-card">
              <div className="bk-stat-icon">✍️</div>
              <div className="bk-stat-num">{stats.authors.toLocaleString()}</div>
              <div className="bk-stat-label">Autores</div>
            </div>

          </div>
        </div>
      </section>

      <section className="bk-section">
        <div className="bk-container">
          <div className="bk-section-head">
            <h2>Lo que dicen los lectores</h2>
            <p>Miles de amantes de los libros confían en Los Libritos de Yajuala.</p>
          </div>

          {reviewsLoading && (
            <div className="bk-sale-loading">⏳ Cargando testimonios…</div>
          )}

          {reviewsError && !reviewsLoading && (
            <div className="bk-sale-error">⚠️ {reviewsError}</div>
          )}

          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <div className="bk-sale-empty">📭 Aún no hay testimonios.</div>
          )}

          {!reviewsLoading && !reviewsError && reviews.length > 0 && (
            <div className="bk-testimonials-grid">
              {reviews.map((r, i) => (
                <TestimonialCard
                  key={i}
                  name={`Cliente #${r.id_cliente}`}
                  role="Lector verificado"
                  stars={"★".repeat(r.puntuacion) + "☆".repeat(5 - r.puntuacion)}
                  text={r.comentario || "Sin comentario"}
                />
              ))}
            </div>
          )}

        </div>
      </section>

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
