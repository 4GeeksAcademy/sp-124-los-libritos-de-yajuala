import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const AddProvider = () => {
    const { providerId } = useParams(); 
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState({
        nombre: "",
        email: "",
        telefono: "",
        documento: "",
        password: ""
    });

    const isEdit = Boolean(providerId);

  
    useEffect(() => {
        if (!isEdit) return;

        setLoading(true);

        fetch(API_BASE + `/api/provider/${providerId}`)
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar proveedor");
                return res.json();
            })
            .then(data => {
                setProvider({
                    nombre: data.nombre || "",
                    email: data.email || "",
                    telefono: data.telefono || "",
                    documento: data.documento || "",
                    password: "" 
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [providerId, isEdit]);

    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProvider({ ...provider, [name]: value });
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();

        const method = isEdit ? "PUT" : "POST";
        const url = isEdit
            ? API_BASE + `/api/provider/${providerId}`
            : API_BASE + "/api/provider";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(provider)
            });

            if (!res.ok) throw new Error("Error al guardar proveedor");

            
            if (!isEdit) {
            navigate("/provider/me");
            return;
            }

            
            navigate("/provider");


        } catch (err) {
            console.error(err);
            alert("Error al guardar el proveedor");
        }
    };

    if (loading) return <p>Cargando proveedor...</p>;

    return (
        <div className="container mt-4">
            <ProviderPanelButtons />
            <h1>{isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}</h1>

            <form onSubmit={handleSubmit} className="mt-3">
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={provider.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={provider.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                        type="text"
                        className="form-control"
                        name="telefono"
                        value={provider.telefono}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Documento</label>
                    <input
                        type="text"
                        className="form-control"
                        name="documento"
                        value={provider.documento}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">
                        Password {isEdit && "(solo si deseas cambiarla)"}
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={provider.password}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn-success me-2">
                    {isEdit ? "Actualizar" : "Crear"}
                </button>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/provider")}
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default AddProvider;
