export default function PaymentSuccessPage() {
    return (
        <div className="container mt-4 text-center">
            <h1>¡Pago realizado con éxito!</h1>
            <p>Gracias por tu compra.</p>

            <a href="/home-client" className="btn btn-primary mt-3">
                Seguir comprando
            </a>
        </div>
    );
}
