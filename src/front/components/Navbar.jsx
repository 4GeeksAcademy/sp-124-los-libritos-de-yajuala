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

  const goToAccount = () => {
    if (!store.user) return;

    switch (store.user.role) {
      case "client":
        navigate("/user");
        break;
      case "admin":
        navigate("/admin");
        break;
      case "provider":
        navigate("/provider/me");
        break;
      case "delivery":
        navigate("/loggeddelivery");
        break;
      default:
        navigate("/");
    }
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
          {store.user && (
            <>
              <span className="me-3">Bienvenido, {store.user.name}</span>

              {store.user.role === "client" && (


                <Link to="/user/cart" className="nav-link me-3">
                  <i className="fas fa-shopping-cart fa-lg"></i>

                </Link>
              )}

              <button
                className="btn btn-outline-primary me-2"
                onClick={goToAccount}
              >
                Mi cuenta
              </button>



              <button
                className="btn btn-danger"
                onClick={handleLogout}>
                Logout
              </button>
            </>

          )}
        </div>
      </nav></>
  );
};
