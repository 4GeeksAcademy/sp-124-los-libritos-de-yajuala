import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditClientPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        lastname: "",
        email: ""
    });

    const fetchCliente = async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`);
        const data = await res.json();
        setForm({
            name: data.name,
            lastname: data.lastname,
            email: data.email
        });
    };

    useEffect(() => {
        fetchCliente();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const updateCliente = async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        if (res.ok) {
            navigate("/clients");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Editar Cliente</h1>

            <div className="card p-4 shadow mt-3">
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        name="name"
                        className="form-control"
                        value={form.name}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input
                        name="lastname"
                        className="form-control"
                        value={form.lastname}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        name="email"
                        className="form-control"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="d-flex">
                    <button className="btn btn-primary" onClick={updateCliente}>
                        Guardar Cambios
                    </button>

                    <button className="btn btn-secondary ms-2" onClick={() => navigate("/clients")}>
                        Cancelar
                    </button>
                </div></div>
        </div>
    );
}
