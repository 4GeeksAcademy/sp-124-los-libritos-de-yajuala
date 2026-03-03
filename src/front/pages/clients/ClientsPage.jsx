import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClientsForm from "../../components/clients/ClientsForm";

export default function ClientsPage() {
    const [clientes, setClientes] = useState([]);
    const [editingClient, setEditingClient] = useState(null);

    const fetchClientes = async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user`);
        const data = await res.json();
        setClientes(data);
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const deleteCliente = async (id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`,
                { method: "DELETE" }
            );

            if (!res.ok) {
                console.error("Error al eliminar cliente:", await res.text());
                return;
            }

           
            fetchClientes();
        } catch (error) {
            console.error("Error en deleteCliente:", error);
        }
    };


    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between">
                <h1 className="mb-4">Clientes</h1>

                <Link to="/clients/create" className="btn btn-warning mb-5">
                    Crear Cliente
                </Link>

            </div>

            <div className="row">
                {clientes.map((c) => (
                    <div key={c.id} className="col-md-4">
                        <div className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{c.name} {c.lastname}</h5>
                                <p className="card-text">{c.email}</p>

                                <Link to={`/clients/${c.id}`} className="btn btn-info me-2">
                                    Ver ficha
                                </Link>

                                <Link to={`/clients/${c.id}/edit`} className="btn btn-primary me-2">
                                    Editar
                                </Link>


                                <button className="btn btn-danger" onClick={() => deleteCliente(c.id)}>
                                    Eliminar
                                </button>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            {editingClient && (
                <ClientsForm
                    cliente={editingClient}
                    onClose={() => setEditingClient(null)}
                    onUpdated={fetchClientes}
                />
            )}
            <div className="text-center mt-4 mb-5">
                <Link to="/" className="btn btn-secondary btn-lg">
                    Volver a inicio
                </Link>
            </div>

        </div>
    );
}
