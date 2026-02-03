import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();

<<<<<<< HEAD
	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
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
=======
  const isClientsPage = location.pathname.startsWith("/clients");

  return (
    <nav className="navbar">
      <div className="text-center mt-5">

        {!isClientsPage && (
          <Link to="/clients" className="btn btn-success btn-lg m-2">
            Clientes
          </Link>
        )}

      </div>
    </nav>
  );
};
>>>>>>> develop
