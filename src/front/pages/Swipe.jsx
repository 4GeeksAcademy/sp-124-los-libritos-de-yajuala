import React, { useEffect, useRef, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const THRESHOLD = 90;
const ROTATION = 18;
const API_BASE = import.meta.env.VITE_BACKEND_URL || window.location.origin;

function getToken() {
  return localStorage.getItem("token");
}

const MODES = {
  books: { label: "Libros", btn: "btn-success" },
  categories: { label: "Categorías", btn: "btn-primary" },
  authors: { label: "Autores", btn: "btn-warning" },
};

function getUrl(mode, userId) {
  if (mode === "books") return `${API_BASE}/api/users/${userId}/swipe/books?limit=20`;
  if (mode === "categories") return `${API_BASE}/api/users/${userId}/swipe/categories?limit=20`;
  if (mode === "authors") return `${API_BASE}/api/users/${userId}/swipe/authors?limit=20`;
}

function postUrl(mode, userId, itemId) {
  if (mode === "books") return `${API_BASE}/api/users/${userId}/swipe/books/${itemId}`;
  if (mode === "categories") return `${API_BASE}/api/users/${userId}/swipe/categories/${itemId}`;
  if (mode === "authors") return `${API_BASE}/api/users/${userId}/swipe/authors/${itemId}`;
}

// NUEVO: endpoints de matches (likes)
function getMatchesUrl(mode, userId) {
  if (mode === "books") return `${API_BASE}/api/users/${userId}/matches/books`;
  if (mode === "categories") return `${API_BASE}/api/users/${userId}/matches/categories`;
  if (mode === "authors") return `${API_BASE}/api/users/${userId}/matches/authors`;
}

function mapItem(mode, item) {
  if (mode === "books") return { id: item.id, title: item.titulo, subtitle: item.autor, img: item.portada };
  if (mode === "categories") return { id: item.id, title: item.nombre, subtitle: item.descripcion, img: null };
  if (mode === "authors") return { id: item.id, title: item.nombre, subtitle: null, img: null };
}

export default function Swipe() {
  const { store } = useGlobalReducer();
  const userId = store.user?.id;

  const [mode, setMode] = useState("books");
  const [cards, setCards] = useState([]);
  const [topIndex, setTopIndex] = useState(-1);
  const [pos, setPos] = useState({ x: 0, y: 0, dragging: false });
  const [anim, setAnim] = useState({ x: 0, y: 0, rot: 0, transition: "transform 0.2s ease" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NUEVO: matches
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState("");

  const startRef = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const rotation = Math.max(-ROTATION, Math.min(ROTATION, (pos.x / 220) * ROTATION));

  const authHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const loadFeed = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError("");
      setCards([]);
      setTopIndex(-1);

      const res = await fetch(getUrl(mode, userId), { headers: authHeaders() });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `GET failed (${res.status})`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.items;
      const mapped = (list || []).map((item) => mapItem(mode, item));

      setCards(mapped);
      setTopIndex((mapped.length || 0) - 1);
    } catch (e) {
      setError(e.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    if (!userId) return;
    try {
      setMatchesLoading(true);
      setMatchesError("");
      setMatches([]);

      const res = await fetch(getMatchesUrl(mode, userId), { headers: authHeaders() });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `GET matches failed (${res.status})`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.items;
      const mapped = (list || []).map((item) => mapItem(mode, item));

      setMatches(mapped);
    } catch (e) {
      setMatchesError(e.message || "Error cargando matches");
    } finally {
      setMatchesLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("No hay usuario logueado");
      setLoading(false);
      setMatchesLoading(false);
      return;
    }
    loadFeed();
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, mode]);

  useEffect(() => {
    setPos({ x: 0, y: 0, dragging: false });
    setAnim({ x: 0, y: 0, rot: 0, transition: "transform 0.2s ease" });
    isAnimatingRef.current = false;
  }, [topIndex]);

  const onPointerDown = (e) => {
    if (topIndex < 0 || isAnimatingRef.current) return;
    pointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    setPos((p) => ({ ...p, dragging: true }));
    setAnim((a) => ({ ...a, transition: "none" }));
  };

  const onPointerMove = (e) => {
    if (!pos.dragging || pointerIdRef.current !== e.pointerId) return;
    setPos({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y, dragging: true });
  };

  const postPreference = async (itemId, preference) => {
    const res = await fetch(postUrl(mode, userId, itemId), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ preference }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `POST failed (${res.status})`);
    }
    return res.json();
  };

  const commitSwipe = async (dir) => {
    if (topIndex < 0 || isAnimatingRef.current) return;
    const current = cards[topIndex];
    if (!current) return;

    isAnimatingRef.current = true;

    try {
      await postPreference(current.id, dir === "right" ? 1 : -1);
    } catch (e) {
      isAnimatingRef.current = false;
      setError(e.message || "No se pudo guardar la preferencia");
      setAnim({ x: 0, y: 0, rot: 0, transition: "transform 0.2s ease" });
      setPos({ x: 0, y: 0, dragging: false });
      return;
    }

    const currentY = pos.y;
    setPos({ x: 0, y: 0, dragging: false });
    const offX = dir === "right" ? window.innerWidth : -window.innerWidth;
    setAnim({ x: offX, y: currentY, rot: dir === "right" ? 30 : -30, transition: "transform 0.25s ease-out" });

    const votedIndex = topIndex;
    setTimeout(() => {
      setCards((prev) => prev.filter((_, idx) => idx !== votedIndex));
      setTopIndex((i) => i - 1);
    }, 260);

    // NUEVO: refresca matches después de votar
    loadMatches();
  };

  const onPointerUp = () => {
    if (!pos.dragging) return;
    setPos((p) => ({ ...p, dragging: false }));
    setAnim((a) => ({ ...a, transition: "transform 0.2s ease" }));
    if (pos.x > THRESHOLD) return commitSwipe("right");
    if (pos.x < -THRESHOLD) return commitSwipe("left");
    setAnim({ x: 0, y: 0, rot: 0, transition: "transform 0.2s ease" });
    setPos({ x: 0, y: 0, dragging: false });
  };

  const topCard = topIndex >= 0 ? cards[topIndex] : null;

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: 20, background: "#c9f0f7" }}>
      {/* zona swipe centrada */}
      <div style={{ display: "grid", placeItems: "center" }}>
        <div style={{ width: 360 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            {Object.entries(MODES).map(([key, { label, btn }]) => (
              <button
                key={key}
                className={`btn ${mode === key ? btn : "btn-outline-secondary"}`}
                onClick={() => setMode(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, opacity: 0.8 }}>
            <span>{topIndex >= 0 ? `${topIndex + 1} / ${cards.length}` : `0 / ${cards.length}`}</span>
            <span>{pos.x > 30 ? "❤️" : pos.x < -30 ? "❌" : " "}</span>
          </div>

          {loading && (
            <div style={{ padding: 12, background: "#fff", borderRadius: 12, marginBottom: 10 }}>
              Cargando...
            </div>
          )}

          {!!error && (
            <div style={{ padding: 12, background: "#fff", borderRadius: 12, marginBottom: 10 }}>
              <b>Error:</b> {error}
            </div>
          )}

          <div style={{ position: "relative", height: 520 }}>
            {cards.map((c, i) => {
              const isTop = i === topIndex;
              const translateY = (topIndex - i) * 6;
              const transform = isTop
                ? `translate(${pos.x + anim.x}px, ${pos.y + anim.y}px) rotate(${rotation + anim.rot}deg)`
                : `translate(0px, ${translateY}px) scale(${isTop ? 1 : 0.98})`;

              return (
                <div
                  key={`${mode}-${c.id}`}
                  onPointerDown={isTop ? onPointerDown : undefined}
                  onPointerMove={isTop ? onPointerMove : undefined}
                  onPointerUp={isTop ? onPointerUp : undefined}
                  onPointerCancel={isTop ? onPointerUp : undefined}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 18,
                    background: "#fff",
                    boxShadow: "0 10px 30px rgba(0,0,0,.15)",
                    overflow: "hidden",
                    touchAction: "none",
                    cursor: isTop ? "grab" : "default",
                    transform,
                    transition: isTop ? anim.transition : "transform 0.2s ease",
                    zIndex: 100 + i,
                    userSelect: "none",
                  }}
                >
                  {c.img ? (
                    <div style={{ height: 240, background: "#eee" }}>
                      <img src={c.img} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{ height: 240, background: "#e8f4f8", display: "grid", placeItems: "center" }}>
                      <span style={{ fontSize: 64 }}>{mode === "categories" ? "🏷️" : "✍️"}</span>
                    </div>
                  )}
                  <div style={{ padding: 16 }}>
                    <h2 style={{ margin: 0, fontSize: 24, textAlign: "center" }}>{c.title}</h2>
                    {c.subtitle && <p style={{ marginTop: 10, opacity: 0.8, textAlign: "center" }}>{c.subtitle}</p>}
                  </div>
                </div>
              );
            })}

            {!loading && cards.length === 0 && (
              <div style={{ padding: 16, background: "#fff", borderRadius: 16, textAlign: "center" }}>
                No hay más {MODES[mode].label.toLowerCase()} por votar 🙌
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 18, position: "relative", zIndex: 9999 }}>
            <button
              onClick={() => commitSwipe("left")}
              disabled={!topCard || loading}
              style={{ width: 56, height: 56, borderRadius: 999, border: "none", fontSize: 22, cursor: "pointer" }}
            >
              ❌
            </button>
            <button
              onClick={() => commitSwipe("right")}
              disabled={!topCard || loading}
              style={{ width: 56, height: 56, borderRadius: 999, border: "none", fontSize: 22, cursor: "pointer" }}
            >
              ❤️
            </button>
          </div>
        </div>
      </div>

      {/* NUEVO: sección inferior matches */}
      <div style={{ maxWidth: 980, margin: "28px auto 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Sugerencias según tus gustos · {MODES[mode].label}</h3>
          <button className="btn btn-sm btn-outline-dark" onClick={loadMatches} disabled={matchesLoading}>
            Refrescar
          </button>
        </div>

        {matchesLoading && (
          <div style={{ padding: 12, background: "#fff", borderRadius: 12 }}>
            Cargando matches...
          </div>
        )}

        {!!matchesError && (
          <div style={{ padding: 12, background: "#fff", borderRadius: 12 }}>
            <b>Error:</b> {matchesError}
          </div>
        )}

        {!matchesLoading && !matchesError && matches.length === 0 && (
          <div style={{ padding: 12, background: "#fff", borderRadius: 12 }}>
            Aún no tienes matches aquí. Dale ❤️ a algo 🙂
          </div>
        )}

        {!matchesLoading && matches.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {matches.map((m) => (
              <div
                key={`match-${mode}-${m.id}`}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  boxShadow: "0 6px 18px rgba(0,0,0,.10)",
                  overflow: "hidden",
                }}
              >
                {m.img ? (
                  <div style={{ height: 140, background: "#eee" }}>
                    <img src={m.img} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ height: 140, background: "#e8f4f8", display: "grid", placeItems: "center" }}>
                    <span style={{ fontSize: 40 }}>{mode === "categories" ? "🏷️" : mode === "authors" ? "✍️" : "📚"}</span>
                  </div>
                )}

                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{m.title}</div>
                  {m.subtitle && <div style={{ opacity: 0.75, marginTop: 6, fontSize: 14 }}>{m.subtitle}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}