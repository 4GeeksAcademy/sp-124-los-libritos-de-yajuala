import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Delivery } from "../Delivery/DeliveryList";

const LoggedDelivery = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !storedUser.id) {
      navigate("/delivery/login");
      return;
    }

    if (storedUser.role !== "delivery") {
      navigate("/");
      return;
    }

    setUser(storedUser);
    setLoading(false);
  }, [navigate]);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="container mt-5">
      <h1>Panel de Repartidor 🚴‍♂️</h1>
      <p>Bienvenido, {user.nombre}</p>

      <Delivery />
    </div>
  );
};

export default LoggedDelivery;
