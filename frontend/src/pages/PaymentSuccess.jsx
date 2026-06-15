import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

function PaymentSuccess() {
  const order = JSON.parse(localStorage.getItem('lastOrder'))

  return (
    <section className="section success">
      <CheckCircle size={80} />

      <h1>Pagamento aprovado!</h1>
      <p>Seu pedido foi finalizado com sucesso.</p>

      {order && (
        <div className="order-box">
          <p><strong>Pedido:</strong> #{order.id}</p>
          <p><strong>Cliente:</strong> {order.customer.name}</p>
          <p><strong>Pagamento:</strong> {order.customer.payment}</p>
          <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
          <p><strong>Status:</strong> {order.status}</p>
        </div>
      )}

      <Link to="/minhas-compras" className="btn">
        Ver minhas compras
      </Link>
    </section>
  )
}

export default PaymentSuccess