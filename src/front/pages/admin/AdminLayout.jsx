import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export default function AdminLayout() {
  const { store, actions } = useGlobalReducer();
  const navigate = useNavigate();

  if (store.user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    actions.logout();
    navigate("/");      
  };

  return (
    <div className="admin-layout">

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/admin/dashboard">
            Panel Admin
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#adminNavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="adminNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">

              <li className="nav-item">
                <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/admin/users">Usuarios</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/admin/providers">Proveedores</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/admin/books">Libros</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/admin/categories">Categorías</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/admin/carts">Pedidos</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/admin/delivery">Repartidores</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/admin/reviews">Reviews</Link>
              </li>

            </ul>
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </nav>
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
}
