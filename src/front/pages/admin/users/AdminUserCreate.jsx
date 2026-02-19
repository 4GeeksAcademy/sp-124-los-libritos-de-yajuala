import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminUserCreate() {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [form, setForm] = useState({
        name: "",
        lastname: "",
        email: "",
        password: "",
        role: "client"
    });

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const resp = await fetch(`${backendUrl}/api/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(form)
        });

        if (resp.ok) navigate("/admin/users");
        else alert("Error creando usuario");
    };

    return (
        <div>
            <h1>Crear Usuario</h1>

            <form onSubmit={handleSubmit} className="col-6">

                <input
                    className="form-control mb-2"
                    name="name"
                    placeholder="Nombre"
                    value={form.name}
                    onChange={handleChange}
                />

                <input
                    className="form-control mb-2"
                    name="lastname"
                    placeholder="Apellido"
                    value={form.lastname}
                    onChange={handleChange}
                />

                <input
                    className="form-control mb-2"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />

                <input
                    className="form-control mb-2"
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={handleChange}
                />

                <select
                    className="form-control mb-2"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                >
                    <option value="client">Cliente</option>
                    <option value="admin">Admin</option>
                    <option value="provider">Proveedor</option>
                    <option value="delivery">Repartidor</option>
                </select>

                <button className="btn btn-success">Crear</button>
            </form>
        </div>
    );
}
