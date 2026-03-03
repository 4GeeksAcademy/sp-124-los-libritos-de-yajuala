import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminCategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    fetch(`${backendUrl}/api/categorias/${id}`)
      .then(res => res.json())
      .then(data => {
        setNombre(data.nombre);
        setDescripcion(data.descripcion || "");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resp = await fetch(`${backendUrl}/api/categorias/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre,
        descripcion
      })
    });

    if (resp.ok) {
      navigate("/admin/categories");
    } else {
      alert("Error al guardar cambios");
    }
  };

  return (
    <div>
      <h1>Editar Categoría #{id}</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-control"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
        </div>

        <button className="btn btn-primary">Guardar cambios</button>
      </form>
    </div>
  );
}
