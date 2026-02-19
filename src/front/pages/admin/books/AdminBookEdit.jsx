import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminBookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const token = localStorage.getItem("token");

  const [form, setForm] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/books/${id}`)
      .then(res => res.json())
      .then(data => setForm(data));

    fetch(`${backendUrl}/api/categorias`)
      .then(res => res.json())
      .then(data => setCategorias(data));

    fetch(`${backendUrl}/api/libros/${id}/categorias`)
      .then(res => res.json())
      .then(data => setCategoriasSeleccionadas(data.map(c => c.id)));

    fetch(`${backendUrl}/api/provider`)
      .then(res => res.json())
      .then(data => setProviders(data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategorias = e => {
    const values = [...e.target.options]
      .filter(o => o.selected)
      .map(o => parseInt(o.value));
    setCategoriasSeleccionadas(values);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const resp = await fetch(`${backendUrl}/api/books/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });

    if (!resp.ok) return alert("Error editando libro");

    await fetch(`${backendUrl}/api/libros/${id}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categorias: categoriasSeleccionadas })
    });

    navigate("/admin/books");
  };

  if (!form) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Editar Libro</h1>

      <form onSubmit={handleSubmit} className="col-6">

        <input className="form-control mb-2" name="titulo" value={form.titulo} onChange={handleChange} />
        <input className="form-control mb-2" name="autor" value={form.autor} onChange={handleChange} />
        <input className="form-control mb-2" name="isbn" value={form.isbn} onChange={handleChange} />
        <input className="form-control mb-2" name="precio" value={form.precio} onChange={handleChange} />

        <label>Proveedor</label>
        <select
          className="form-control mb-3"
          name="provider_id"
          value={form.provider_id || ""}
          onChange={handleChange}
        >
          <option value="">Seleccione un proveedor</option>
          {providers.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.email})
            </option>
          ))}
        </select>

        <label>Categorías</label>
        <select
          multiple
          className="form-control mb-3"
          value={categoriasSeleccionadas}
          onChange={handleCategorias}
        >
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>

        <button className="btn btn-warning">Guardar cambios</button>
      </form>
    </div>
  );
}
