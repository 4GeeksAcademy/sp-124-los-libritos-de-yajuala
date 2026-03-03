import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminUserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [form, setForm] = useState(null);

    useEffect(() => {
        fetch(`${backendUrl}/api/user/${id}`)
            .then(res => res.json())
            .then(data => setForm(data));
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const resp = await fetch(`${backendUrl}/api/user/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        if (resp.ok) navigate("/admin/users");
        else alert("Error editando usuario");
    };

    if (!form) return <p>Cargando...</p>;

    return (
        <div>
            <h1>Editar Usuario</h1>

            <form onSubmit={handleSubmit} className="col-6">
                <input className="form-control mb-2" name="name" value={form.name} onChange={handleChange} />
                <input className="form-control mb-2" name="lastname" value={form.lastname} onChange={handleChange} />
                <input className="form-control mb-2" name="email" value={form.email} onChange={handleChange} />

                <button className="btn btn-warning">Guardar cambios</button>
            </form>
        </div>
    );
}
