import React, { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, Link, useLocation } from "react-router-dom";

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


	return (
		<div className="text-center mt-5">
			{isAdmin && ( 
				<> 
					<Link to="/clients" className="btn btn-success btn-lg m-2">Clientes</Link> 
					<Link to="/provider" className="btn btn-warning btn-lg m-2">Proveedores</Link> 
					<Link to="/categorialibro" className="btn btn-info btn-lg m-2">Categorías Libros</Link> 
					<Link to="/categorias" className="btn btn-info btn-lg m-2">Categorías</Link> 
					<Link to="/carts" className="btn btn-danger btn-lg m-2">Ver Carritos</Link> 
					<button className="btn btn-info btn-lg m-2" onClick={() => navigate("/delivery")}> Repartidores </button> 
					<button className="btn btn-primary btn-lg m-2" onClick={() => navigate("/books")}> Ir a Libros </button> 
					<button className="btn btn-success btn-lg m-2" onClick={() => navigate("/reviews")}> Reviews </button> 
				</> 
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
				<Link to="/login" className="btn btn-primary btn-lg m-2">
					Login
				</Link>
			)}

			{!user && (
				<Link to="/login/provider" className="btn btn-warning btn-lg m-2">
					Login Proveedor
				</Link>
			)}


		</div>
	);
};
