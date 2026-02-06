import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditCartBookPage() {
    const { id } = useParams(); // id del item cart_book
    const navigate = useNavigate();

    const [item, setItem] = useState(null);

    const fetchItem = async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart-books/${id}`);
        const data = await res.json();
        setItem(data);
    };

    useEffect(() => {
        fetchItem();
    }, []);

    const handleChange = (e) => {
        setItem({ ...item, [e.target.name]: e.target.value });
    };

    const updateItem = async () => {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart-books/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cantidad: item.cantidad,
                precio: item.precio,
                descuento: item.descuento
            })
        });

        navigate(`/carts/${item.id_carrito}`);
    };

    if (!item) return <p className="text-center mt-5">Cargando...</p>;

    return (
        <div className="container mt-4">
            <h1>Editar libro del carrito</h1>

            <div className="card p-4 shadow mt-3">

                <h4>{item.libro?.titulo}</h4>
                <p className="text-muted">{item.libro?.autor}</p>

                <div className="mb-3">
                    <label className="form-label">Cantidad</label>
                    <input
                        type="number"
                        name="cantidad"
                        className="form-control"
                        value={item.cantidad}
                        onChange={handleChange}
                        min="1"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Precio</label>
                    <input
                        type="number"
                        name="precio"
                        className="form-control"
                        value={item.precio}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Descuento (%)</label>
                    <input
                        type="number"
                        name="descuento"
                        className="form-control"
                        value={item.descuento}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>
                <div className="d-flex">
                    <button className="btn btn-primary" onClick={updateItem}>
                        Guardar cambios
                    </button>

                    <button
                        className="btn btn-secondary ms-2"
                        onClick={() => navigate(`/carts/${item.id_carrito}`)}
                    >
                        Cancelar
                    </button>
                </div></div>
        </div>
    );
}
