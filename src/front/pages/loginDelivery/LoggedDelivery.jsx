import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const LoggedDelivery = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esperar a que el store esté listo
    if (!store.token || !store.user) return;

    // Bloqueo por rol
    if (store.user.role !== "delivery") {
      navigate("/");
      return;
    }

    // Todo OK → mostrar vista
    setLoading(false);
  }, [store.token, store.user, navigate]);


  if (loading) return <p>Cargando...</p>;

  return (
    <div className="container mt-5">
      <h1>Panel de Repartidor 🚴‍♂️</h1>
      <p>Bienvenido, {store.user.nombre}</p>
    </div>
  );
};

export default LoggedDelivery;
