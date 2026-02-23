import React, { useEffect, useRef, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const THRESHOLD = 90;
const ROTATION = 18;
const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

const MODES = {
  books:      { label: "Libros",      btn: "btn-success" },
  categories: { label: "Categorías",  btn: "btn-primary" },
  authors:    { label: "Autores",     btn: "btn-warning" },
};

function getUrl(mode, userId) {
  if (mode === "books")      return `${API_BASE}/api/users/${userId}/swipe/books?limit=20`;
  if (mode === "categories") return `${API_BASE}/api/users/${userId}/swipe/categories?limit=20`;
  if (mode === "authors")    return `${API_BASE}/api/users/${userId}/swipe/authors?limit=20`;
}

function postUrl(mode, userId, itemId) {
  if (mode === "books")      return `${API_BASE}/api/users/${userId}/swipe/books/${itemId}`;
  if (mode === "categories") return `${API_BASE}/api/users/${userId}/swipe/categories/${itemId}`;
  if (mode === "authors")    return `${API_BASE}/api/users/${userId}/swipe/authors/${itemId}`;
}

function mapItem(mode, item) {
  if (mode === "books")      return { id: item.id, title: item.titulo,  subtitle: item.autor,       img: item.portada };
  if (mode === "categories") return { id: item.id, title: item.nombre,  subtitle: item.descripcion, img: null };
  if (mode === "authors")    return { id: item.id, title: item.nombre,  subtitle: null,             img: null };
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

  const startRef = useRef({ x: 0, y: 0 });
  const pointerIdRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const rotation = Math.max(-ROTATION, Math.min(ROTATION, (pos.x / 220) * ROTATION));

  useEffect(() => {
    if (!userId) {
      setError("No hay usuario logueado");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setCards([]);
        setTopIndex(-1);

        const token = getToken();
        const res = await fetch(getUrl(mode, userId), {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

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

    load();
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
    const token = getToken();
    const res = await fetch(postUrl(mode, userId, itemId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
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
      setCards(prev => prev.filter((_, idx) => idx !== votedIndex));
      setTopIndex((i) => i - 1);
    }, 260);
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
    <div style={{ minHeight: "calc(100vh - 80px)", display: "grid", placeItems: "center", padding: 20, background: "#c9f0f7" }}>
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
                  position: "absolute", inset: 0, borderRadius: 18,
                  background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.15)",
                  overflow: "hidden", touchAction: "none",
                  cursor: isTop ? "grab" : "default",
                  transform, transition: isTop ? anim.transition : "transform 0.2s ease",
                  zIndex: i, userSelect: "none",
                }}
              >
                {c.img ? (
                  <div style={{ height: 240, background: "#eee" }}>
                    <img src={c.img} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ height: 240, background: "#e8f4f8", display: "grid", placeItems: "center" }}>
                    <span style={{ fontSize: 64 }}>
                      {mode === "categories" ? "🏷️" : "✍️"}
                    </span>
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

        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 18 }}>
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
  );
}