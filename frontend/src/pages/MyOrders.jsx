import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function MyOrders() {
  const { user } = useAuth()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/orders/my-orders')
        setOrders(response.data)
      } catch (error) {
        setError(
          error.response?.data?.message ||
          'Erro ao buscar suas compras.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user])

  if (!user) {
    return (
      <section className="section empty">
        <h1>Faça login para ver suas compras</h1>
        <p>Entre na sua conta para visualizar seus pedidos.</p>
        <Link to="/login" className="btn">Entrar</Link>
      </section>
    )
  }

  if (loading) {
    return <h2 className="message">Carregando compras...</h2>
  }

  if (error) {
    return (
      <section className="section empty">
        <h1>Erro ao carregar compras</h1>
        <p>{error}</p>
        <Link to="/produtos" className="btn">Voltar aos produtos</Link>
      </section>
    )
  }

  if (orders.length === 0) {
    return (
      <section className="section empty">
        <h1>Nenhuma compra encontrada</h1>
        <p>Suas compras finalizadas aparecerão aqui.</p>
        <Link to="/produtos" className="btn">Comprar agora</Link>
      </section>
    )
  }

  return (
    <section className="section">
      <h1>Minhas compras</h1>

      <div className="orders">
        {orders.map(order => (
          <div className="order-box" key={order._id}>
            <h2>Pedido #{order._id}</h2>

            <p>
              <strong>Cliente:</strong> {order.customer?.name}
            </p>

            <p>
              <strong>Pagamento:</strong> {order.customer?.payment}
            </p>

            <p>
              <strong>Status:</strong> {order.status}
            </p>

            <p>
              <strong>Total:</strong> R$ {order.total.toFixed(2)}
            </p>

            <p>
              <strong>Data:</strong>{' '}
              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </p>

            {order.trackingCode && (
              <p>
                <strong>Rastreio:</strong> {order.trackingCode}
              </p>
            )}

            {order.items.map(item => (
              <div className="order-item" key={`${order._id}-${item.productId}`}>
                <img src={item.image} alt={item.name} />
                <span>
                  {item.name} - {item.quantity}x - Tam: {item.selectedSize}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default MyOrders