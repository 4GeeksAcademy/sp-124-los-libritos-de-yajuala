import React, { useEffect } from "react";
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, Link, useLocation } from "react-router-dom";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();
	const location = useLocation();

	const isClientsPage = location.pathname.startsWith("/clients");

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;

			if (!backendUrl)
				throw new Error("VITE_BACKEND_URL is not defined in .env file");

			const response = await fetch(backendUrl + "/api/hello");
			const data = await response.json();

			if (response.ok) dispatch({ type: "set_hello", payload: data.message });

			return data;
		} catch (error) {
			if (error.message)
				throw new Error(
					`Could not fetch the message from the backend.
Please check if the backend is running and the backend port is public.`
				);
		}
	};

	useEffect(() => {
		loadMessage();
	}, []);

	return (
		<div className="text-center mt-5">

			{!isClientsPage && (
				<Link to="/clients" className="btn btn-success btn-lg m-2">
					Clientes
				</Link>
			)}

			{/* Botón Layla ir a libros */}
			<button
				type="button"
				className="btn btn-primary btn-lg"
				onClick={() => navigate("/books")}
			>
				Ir a Libros
			</button>

			<Link to="/provider" className="btn btn-warning btn-lg m-2">
				<span className="navbar-brand mb-0 h1">Proveedores</span>
			</Link>
			<Link to="/categorialibro" className="btn btn-info btn-lg m-2">
				<span className="navbar-brand mb-0 h1">Categorías Libros</span>
			</Link>
			<Link to="/categorias" className="btn btn-info btn-lg m-2">
				<span className="navbar-brand mb-0 h1">Categorías</span>
			</Link>


			<Link to="/carts" className="btn btn-danger btn-lg">
				Ver Carritos
			</Link>

			<button
				type="button" className="btn btn-info btn-lg m-2"
				onClick={() => navigate("/delivery")}>
				Repartidores
			</button>

			<button
				type="button" className="btn btn-success btn-lg m-2"
				onClick={() => navigate("/reviews")}>
				Reviews
			</button>



		</div>
	);
};
