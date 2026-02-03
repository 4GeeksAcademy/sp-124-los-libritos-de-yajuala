import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
	const location = useLocation();

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				{!isClientsPage && (
					<Link to="/clients" className="btn btn-success btn-lg m-2">
						Clientes
					</Link>
				)}
				<Link to="/">
					<span className="navbar-brand mb-0 h1">Back to Home</span>
				</Link>
				<Link to="/provider">
					<span className="navbar-brand mb-0 h1">Proveedores</span>
				</Link>
				<div className="ml-auto">
					<Link to="/demo">
						<button className="btn btn-primary">Check the Context in action</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};
