import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://legendary-eureka-q5gwp4q94f67vr-3001.app.github.dev";

const Provider = () => {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Cargar proveedores
  useEffect(() => {
    fetch(API_BASE + "/api/provider")
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar proveedores");
        return res.json();
      })
      .then(data => {
        setProviders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Eliminar proveedor
  const deleteProvider = async (id) => {
    const confirmDelete = confirm("¿Seguro que quieres eliminar este proveedor?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(API_BASE + `/api/provider/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar proveedor");

      setProviders(providers.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrado por buscador
  const filteredProviders = providers.filter(provider =>
    provider.nombre.toLowerCase().includes(search.toLowerCase()) ||
    provider.email?.toLowerCase().includes(search.toLowerCase()) ||
    provider.documento?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Cargando proveedores...</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h1>Listado de Proveedores</h1>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/providers/new")}
        >
          + Nuevo Proveedor
        </button>
      </div>

      {/* Buscador */}
      <input
        type="text"
        className="form-control mt-3"
        placeholder="Buscar por nombre, email o documento..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredProviders.length === 0 ? (
        <p className="mt-3">No hay proveedores que coincidan</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Documento</th>
              <th style={{ width: "160px" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProviders.map(provider => (
              <tr key={provider.id}>
                <td>{provider.id}</td>
                <td>{provider.nombre}</td>
                <td>{provider.email}</td>
                <td>{provider.telefono}</td>
                <td>{provider.documento}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => navigate(`/provider/view/${provider.id}`)}
                  >
                    Ver
                  </button>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => navigate(`/provider/${provider.id}`)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteProvider(provider.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Provider;
