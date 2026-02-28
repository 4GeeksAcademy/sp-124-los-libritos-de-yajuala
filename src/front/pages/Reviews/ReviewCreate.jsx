import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlobalReducer from '../../hooks/useGlobalReducer.jsx';
import '../../styles/client.css';

export const ReviewCreate = () => {
  const navigate = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
  const { store } = useGlobalReducer();

  const [form, setForm] = useState({ id_libro: '', puntuacion: 0, comentario: '' });
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    fetch(`${backendUrl}/api/books`)
      .then((r) => r.json())
      .then((data) => setLibros(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_libro || !form.puntuacion) {
      alert('Selecciona libro y puntuación');
      return;
    }
    setSaving(true);
    try {
      const resp = await fetch(`${backendUrl}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${store.token}` },
        body: JSON.stringify({
          id_libro: Number(form.id_libro),
          puntuacion: Number(form.puntuacion),
          comentario: form.comentario || null,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert(data.msg || 'Error creando reseña');
        return;
      }
      navigate('/reviews');
    } catch {
      alert('Error de red');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="cl-page">
        <div className="cl-loader">Cargando libros</div>
      </div>
    );

  return (
    <div className="cl-page cl-page-narrow">
      <div className="cl-page-header">
        <div className="cl-page-header-left">
          <div className="cl-breadcrumb">
            <span onClick={() => navigate('/reviews')} style={{ cursor: 'pointer' }}>
              Reseñas
            </span>
            <span>›</span>
            <span>Nueva reseña</span>
          </div>
          <h1 className="cl-title">Escribir reseña</h1>
          <p className="cl-subtitle">Comparte tu opinión con otros lectores</p>
        </div>
      </div>

      <div className="cl-card">
        <div className="cl-card-body">
          <form onSubmit={handleSubmit}>
            {/* Selector de libro */}
            <div className="cl-form-group">
              <label className="cl-label">Libro</label>
              <select
                className="cl-select"
                value={form.id_libro}
                onChange={(e) => setForm({ ...form, id_libro: e.target.value })}
                required
              >
                <option value="">— Selecciona un libro —</option>
                {libros.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titulo} · {l.autor}
                  </option>
                ))}
              </select>
            </div>

            {/* Puntuación con estrellas */}
            <div className="cl-form-group">
              <label className="cl-label">Puntuación</label>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={`cl-star-input${i <= (hover || form.puntuacion) ? ' active' : ''}`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setForm({ ...form, puntuacion: i })}
                  >
                    ★
                  </button>
                ))}
                {form.puntuacion > 0 && (
                  <span
                    style={{ fontSize: '13px', color: 'var(--cl-text-muted)', marginLeft: '8px' }}
                  >
                    {form.puntuacion}/5
                  </span>
                )}
              </div>
            </div>

            {/* Comentario */}
            <div className="cl-form-group">
              <label className="cl-label">
                Comentario{' '}
                <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>
                  (opcional)
                </span>
              </label>
              <textarea
                className="cl-textarea"
                rows={4}
                placeholder="¿Qué te ha parecido el libro?"
                value={form.comentario}
                onChange={(e) => setForm({ ...form, comentario: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="cl-btn cl-btn-accent cl-btn-lg" disabled={saving}>
                {saving ? 'Publicando...' : 'Publicar reseña'}
              </button>
              <button
                type="button"
                className="cl-btn cl-btn-ghost cl-btn-lg"
                onClick={() => navigate('/reviews')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
