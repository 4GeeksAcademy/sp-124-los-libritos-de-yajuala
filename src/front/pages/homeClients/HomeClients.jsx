import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function HomeClients() {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [books, setBooks] = useState([]);

    const addToCart = async (book) => {
        try {
            const resCart = await fetch(`${backendUrl}/api/clients/${store.user.id}/carts/active`);
            const dataCart = await resCart.json();

            let cartId = null;

            if (!dataCart.active) {
                const resNew = await fetch(`${backendUrl}/api/carts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_cliente: store.user.id,
                        monto_total: 0,
                        estado: "pendiente"
                    })
                });

                const newCart = await resNew.json();
                cartId = newCart.id;
            } else {
                cartId = dataCart.cart.id;
            }

           
            const provider_book_id = book?.proveedores?.[0]?.provider_book_id;

            if (!provider_book_id) {
                alert("Este libro no tiene inventario disponible");
                return;
            }

            const resAdd = await fetch(`${backendUrl}/api/cart-books`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_carrito: cartId,
                    id_libro: book.id,
                    provider_book_id: provider_book_id, 
                    cantidad: 1,
                    precio: book.precio
                })
            });

            const dataAdd = await resAdd.json();

            if (!resAdd.ok) {
                alert(dataAdd.msg || "Error al añadir al carrito");
                return;
            }

            alert(`"${book.titulo}" añadido al carrito`);

        } catch (err) {
            console.error(err);
            alert("Error inesperado");
        }
    };


    useEffect(() => {
        if (!store.user) {
            navigate("/login");
            return;
        }

        fetch(`${backendUrl}/api/books`)
            .then((res) => res.json())
            .then((data) => setBooks(data))
            .catch((err) => console.error(err));
    }, [store.user]);

    return (
        <div className="container mt-4">
            <h1>Bienvenido, {store.user?.name || store.user?.email}</h1>
            <h3 className="mt-4">Libros disponibles</h3>

            <div className="row mt-3">
                {books.map((b) => (
                    <div key={b.id} className="col-12 col-md-4 mb-4">
                        <div className="card p-3">
                            <h5>{b.titulo}</h5>
                            <p className="text-muted">{b.autor}</p>
                            <p><b>{b.precio} €</b></p>

                            <button
                                className="btn btn-success mt-2"
                                onClick={() => addToCart(b)}
                            >
                                Añadir al carrito
                            </button>

                            <button
                                className="btn btn-primary mt-2"
                                onClick={() => navigate(`/books/${b.id}`)}
                            >
                                Ver detalle
                            </button>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
