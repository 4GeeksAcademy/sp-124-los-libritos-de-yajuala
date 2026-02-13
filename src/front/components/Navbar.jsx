import { Link, useLocation, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


export const Navbar = () => {
  const location = useLocation();
  const { store, actions } = useGlobalReducer();
  const navigate = useNavigate();

  const handleLogout = () => {
    actions.setUser(null);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
        <a className="navbar-brand" onClick={() => navigate("/")}>
          Los Libritos de Yajuala
        </a>
        <span className="ms-3" style={{ cursor: "pointer", fontWeight: "500" }} onClick={() => navigate("/")}
        >
          Home
        </span>

        <div className="ms-auto d-flex align-items-center">
          {store.user ? (
            <>
              <span className="me-3">Bienvenido, {store.user.name}</span>

              {store.user.role !== "admin" && (
                <>

                  <Link to="/user/cart" className="nav-link me-3">
                    <i className="fas fa-shopping-cart fa-lg"></i>

                  </Link>


                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => navigate("/user")}
                  >
                    Mi cuenta
                  </button>

                </>
              )}


              <button
                className="btn btn-danger"
                onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <></>
          )}
        </div>
      </nav></>
  );
};
