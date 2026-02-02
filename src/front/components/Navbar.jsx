import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();

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
