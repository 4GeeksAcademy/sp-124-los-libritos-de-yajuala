import { useEffect, useState } from "react";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function AddressesPage() {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [addresses, setAddresses] = useState([]);

  const load = async () => {
    const res = await fetch(`${backendUrl}/api/users/${store.user.id}/addresses`);
    const data = await res.json();
    setAddresses(data);
  };

  useEffect(() => {
    if (!store.user) navigate("/login");
    else load();
  }, [store.user]);

  const deleteAddress = async (id) => {
    await fetch(`${backendUrl}/api/addresses/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="container mt-4">
      <h1>Mis direcciones</h1>

      <button
        className="btn btn-success mt-3"
        onClick={() => navigate("/addresses/create")}
      >
        Añadir dirección
      </button>

      <ul className="list-group mt-4">
        {addresses.map((a) => (
          <li key={a.id} className="list-group-item d-flex justify-content-between">
            <div>
              <b>{a.nombre}</b>
              <div>{a.direccion}</div>
              <div>{a.ciudad}, {a.provincia}</div>
              <div>{a.codigo_postal}</div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/addresses/${a.id}/edit`)}
              >
                Editar
              </button>

              <button
                className="btn btn-danger"
                onClick={() => deleteAddress(a.id)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        className="btn btn-secondary mt-4"
        onClick={() => navigate("/checkout/address")}
      >
        Volver al carrito
      </button>
    </div>
  );
}
