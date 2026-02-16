import React, { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, Link } from "react-router-dom";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const loadMessage = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      if (!backendUrl)
        throw new Error("VITE_BACKEND_URL is not defined in .env file");

      const response = await fetch(backendUrl + "/api/hello");
      const data = await response.json();

      if (response.ok) dispatch({ type: "set_hello", payload: data.message });
    } catch (error) {
      console.error("Error loading message", error);
    }
  };

  useEffect(() => {
    loadMessage();
  }, []);

  const user = store.user;
  const role = store.user?.role;
  const isAdmin = role === "admin";
  const isProvider = role === "provider";
  const isDelivery = role === "delivery";
  const isClient = role === "client";
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [isAdmin]);

  return (
    <div className="text-center mt-5">

      {isAdmin && (
        <Link to="/admin/dashboard" className="btn btn-primary btn-lg m-2">
          Ir al Panel Admin
        </Link>
      )}

      {isProvider && (
        <>
          <Link to="/categorialibro" className="btn btn-info btn-lg m-2">Categorías Libros</Link>
          <Link to="/categorias" className="btn btn-info btn-lg m-2">Categorías</Link>
          <button className="btn btn-primary btn-lg m-2" onClick={() => navigate("/books")}> Ir a Libros </button>
          <button className="btn btn-success btn-lg m-2" onClick={() => navigate("/reviews")}> Reviews </button>
        </>
      )}

      {isDelivery && (
        <>
          <Link to="/clients" className="btn btn-success btn-lg m-2">Clientes</Link>
          <Link to="/carts" className="btn btn-danger btn-lg m-2">Ver Carritos</Link>
        </>
      )}

      {isClient && (
        <>
          <Link to="/categorialibro" className="btn btn-info btn-lg m-2">Categorías Libros</Link>
          <Link to="/categorias" className="btn btn-info btn-lg m-2">Categorías</Link>
          <button className="btn btn-primary btn-lg m-2" onClick={() => navigate("/books")}> Ir a Libros </button>
          <button className="btn btn-success btn-lg m-2" onClick={() => navigate("/reviews")}> Reviews </button>
        </>
      )}

      {!user && (
        <>
          <Link to="/login" className="btn btn-primary btn-lg m-2">
            Login Cliente
          </Link>

          <Link to="/login/provider" className="btn btn-warning btn-lg m-2">
            Login Proveedor
          </Link>

          <Link to="/login/admin" className="btn btn-secondary btn-lg m-2">
            Login Admin
          </Link>

          <Link to="/logindelivery" className="btn btn-primary btn-lg m-2">
            Login Repartidor
          </Link>
        </>
      )}
      <hr className="my-4" />

      <div className="d-flex justify-content-center mb-2">
        <h5>Registro</h5>
      </div>

      <div className="d-flex justify-content-center">
        <Link to="/clients/create" className="btn btn-primary btn-lg m-2">
          Registro Cliente
        </Link>

        <Link to="/provider/create" className="btn btn-warning btn-lg m-2">
          Registro Proveedor
        </Link>
      </div>

      {!user && (
        <Link to="/delivery/register" className="btn btn-info btn-lg m-2">
          Registro Repartidor
        </Link>
      )}




      {/*  Accesos rapidos SIEMPRE visibles (para pruebas) */}
      <hr className="my-4" />
      <h4 className="mb-3">Accesos rápidos (DEV)</h4>

      <div className="d-flex flex-wrap justify-content-center">
        <Link to="/clients" className="btn btn-success btn-lg m-2">Clientes</Link>
        <Link to="/provider" className="btn btn-warning btn-lg m-2">Proveedores</Link>
        <Link to="/categorialibro" className="btn btn-info btn-lg m-2">Categorías Libros</Link>
        <Link to="/categorias" className="btn btn-info btn-lg m-2">Categorías</Link>
        <Link to="/carts" className="btn btn-danger btn-lg m-2">Ver Carritos</Link>
        <button className="btn btn-info btn-lg m-2" onClick={() => navigate("/delivery")}>Repartidores</button>
        <button className="btn btn-primary btn-lg m-2" onClick={() => navigate("/books")}>Ir a Libros</button>
        <button className="btn btn-success btn-lg m-2" onClick={() => navigate("/reviews")}>Reviews</button>
        <button className="btn btn-warning btn-lg m-2" onClick={() => navigate("/provider/books")}>Libros Proveedor</button>
      </div>
    </div>
  );
};
