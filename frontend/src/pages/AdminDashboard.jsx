import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  RefreshCw,
  ArrowRight,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react'
import api from '../services/api'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/dashboard')
      setStats(response.data)
    } catch (error) {
      setError('Erro ao carregar dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  function shortId(id) {
    if (!id) return '------'
    return id.slice(-6).toUpperCase()
  }

  function formatDate(date) {
    if (!date) return 'Data não informada'

    return new Date(date).toLocaleDateString('pt-BR')
  }

  function getStatusIcon(status) {
    if (status === 'Pagamento aprovado') return <Clock size={16} />
    if (status === 'Em separação') return <Package size={16} />
    if (status === 'Enviado') return <Truck size={16} />
    if (status === 'Entregue') return <CheckCircle size={16} />
    if (status === 'Cancelado') return <XCircle size={16} />

    return <Clock size={16} />
  }

  function getStatusClass(status) {
    if (status === 'Pagamento aprovado') return 'approved'
    if (status === 'Em separação') return 'preparing'
    if (status === 'Enviado') return 'sent'
    if (status === 'Entregue') return 'delivered'
    if (status === 'Cancelado') return 'canceled'

    return ''
  }

  const dashboardData = useMemo(() => {
    if (!stats) {
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        revenue: 0,
        lowStockProducts: [],
        recentOrders: [],
        averageTicket: 0
      }
    }

    const totalOrders = Number(stats.totalOrders || 0)
    const revenue = Number(stats.revenue || 0)

    return {
      totalProducts: Number(stats.totalProducts || 0),
      totalOrders,
      totalUsers: Number(stats.totalUsers || 0),
      revenue,
      lowStockProducts: stats.lowStockProducts || [],
      recentOrders: stats.recentOrders || [],
      averageTicket: totalOrders > 0 ? revenue / totalOrders : 0
    }
  }, [stats])

  if (loading) {
    return <h2 className="message">Carregando dashboard...</h2>
  }

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <div>
          <span className="admin-label">Visão geral</span>
          <h1>Dashboard Administrativo</h1>
          <p>
            Acompanhe os principais números da UrbanWear em um só lugar.
          </p>
        </div>

        <button className="btn secondary" type="button" onClick={loadDashboard}>
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="dashboard-summary-grid">
        <div className="dashboard-summary-card">
          <Package />
          <div>
            <span>Produtos cadastrados</span>
            <strong>{dashboardData.totalProducts}</strong>
          </div>
        </div>

        <div className="dashboard-summary-card">
          <ShoppingBag />
          <div>
            <span>Total de pedidos</span>
            <strong>{dashboardData.totalOrders}</strong>
          </div>
        </div>

        <div className="dashboard-summary-card">
          <Users />
          <div>
            <span>Usuários cadastrados</span>
            <strong>{dashboardData.totalUsers}</strong>
          </div>
        </div>

        <div className="dashboard-summary-card money">
          <DollarSign />
          <div>
            <span>Faturamento</span>
            <strong>R$ {dashboardData.revenue.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-extra-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Resumo financeiro</h2>
              <p>Indicadores básicos dos pedidos.</p>
            </div>
          </div>

          <div className="finance-box">
            <div>
              <span>Faturamento total</span>
              <strong>R$ {dashboardData.revenue.toFixed(2)}</strong>
            </div>

            <div>
              <span>Ticket médio</span>
              <strong>R$ {dashboardData.averageTicket.toFixed(2)}</strong>
            </div>

            <div>
              <span>Pedidos realizados</span>
              <strong>{dashboardData.totalOrders}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Ações rápidas</h2>
              <p>Acesse as áreas principais do admin.</p>
            </div>
          </div>

          <div className="quick-actions">
            <Link to="/admin">
              Gerenciar produtos
              <ArrowRight size={18} />
            </Link>

            <Link to="/admin/pedidos">
              Ver pedidos
              <ArrowRight size={18} />
            </Link>

            <Link to="/admin/usuarios">
              Gerenciar usuários
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Produtos com estoque baixo</h2>
              <p>Produtos com 5 unidades ou menos.</p>
            </div>

            <AlertTriangle size={24} />
          </div>

          {dashboardData.lowStockProducts.length === 0 ? (
            <div className="dashboard-empty-small">
              Nenhum produto com estoque baixo.
            </div>
          ) : (
            <div className="low-stock-list">
              {dashboardData.lowStockProducts.map(product => (
                <div className="low-stock-item" key={product._id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>

                  <span
                    className={
                      product.stock === 0
                        ? 'low-stock-badge danger'
                        : 'low-stock-badge warning'
                    }
                  >
                    Estoque: {product.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Últimos pedidos</h2>
              <p>Pedidos mais recentes da loja.</p>
            </div>
          </div>

          {dashboardData.recentOrders.length === 0 ? (
            <div className="dashboard-empty-small">
              Nenhum pedido encontrado.
            </div>
          ) : (
            <div className="recent-orders-list">
              {dashboardData.recentOrders.map(order => (
                <div className="recent-order-item" key={order._id}>
                  <div>
                    <strong>Pedido #{shortId(order._id)}</strong>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>

                  <div>
                    <strong>R$ {Number(order.total || 0).toFixed(2)}</strong>

                    <span className={`mini-status ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard