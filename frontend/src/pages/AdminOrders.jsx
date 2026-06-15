import { useEffect, useMemo, useState } from 'react'
import {
  PackageCheck,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  CreditCard,
  MapPin,
  Mail,
  User,
  ShoppingBag,
  CalendarDays,
  Hash,
  FileText,
  Save
} from 'lucide-react'
import api from '../services/api'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [paymentFilter, setPaymentFilter] = useState('Todos')
  const [sortFilter, setSortFilter] = useState('recentes')

  const [orderDrafts, setOrderDrafts] = useState({})

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const statusOptions = [
    'Pagamento aprovado',
    'Em separação',
    'Enviado',
    'Entregue',
    'Cancelado'
  ]

  const paymentOptions = [
    'Todos',
    'Cartão',
    'Pix',
    'Boleto'
  ]

  async function loadOrders() {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/orders')
      setOrders(response.data)

      const drafts = {}

      response.data.forEach(order => {
        drafts[order._id] = {
          trackingCode: order.trackingCode || '',
          notes: order.notes || ''
        }
      })

      setOrderDrafts(drafts)
    } catch (error) {
      setError('Erro ao carregar pedidos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  function showTemporaryMessage(text) {
    setMessage(text)

    setTimeout(() => {
      setMessage('')
    }, 3500)
  }

  function updateDraft(id, field, value) {
    setOrderDrafts(current => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value
      }
    }))
  }

  async function updateOrderAdmin(id, data) {
    setUpdatingId(id)
    setError('')

    try {
      const response = await api.put(`/orders/${id}/admin-update`, data)
      const updatedOrder = response.data

      setOrders(currentOrders =>
        currentOrders.map(order =>
          order._id === id ? updatedOrder : order
        )
      )

      setOrderDrafts(current => ({
        ...current,
        [id]: {
          trackingCode: updatedOrder.trackingCode || '',
          notes: updatedOrder.notes || ''
        }
      }))

      showTemporaryMessage('Pedido atualizado com sucesso.')
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Erro ao atualizar pedido.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  async function updateStatus(id, status) {
    await updateOrderAdmin(id, { status })
  }

  async function saveOrderDetails(order) {
    const draft = orderDrafts[order._id] || {
      trackingCode: '',
      notes: ''
    }

    await updateOrderAdmin(order._id, {
      trackingCode: draft.trackingCode,
      notes: draft.notes
    })
  }

  function formatDate(date) {
    if (!date) return 'Data não informada'

    return new Date(date).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  }

  function shortId(id) {
    if (!id) return '------'
    return id.slice(-6).toUpperCase()
  }

  function getStatusClass(status) {
    if (status === 'Pagamento aprovado') return 'approved'
    if (status === 'Em separação') return 'preparing'
    if (status === 'Enviado') return 'sent'
    if (status === 'Entregue') return 'delivered'
    if (status === 'Cancelado') return 'canceled'
    return ''
  }

  function getStatusIcon(status) {
    if (status === 'Pagamento aprovado') return <PackageCheck size={17} />
    if (status === 'Em separação') return <Clock size={17} />
    if (status === 'Enviado') return <Truck size={17} />
    if (status === 'Entregue') return <CheckCircle size={17} />
    if (status === 'Cancelado') return <XCircle size={17} />
    return <PackageCheck size={17} />
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('Todos')
    setPaymentFilter('Todos')
    setSortFilter('recentes')
  }

  const stats = useMemo(() => {
    const totalOrders = orders.length

    const revenue = orders
      .filter(order => order.status !== 'Cancelado')
      .reduce((acc, order) => acc + Number(order.total || 0), 0)

    const inProgress = orders.filter(order =>
      order.status !== 'Entregue' &&
      order.status !== 'Cancelado'
    ).length

    const delivered = orders.filter(order =>
      order.status === 'Entregue'
    ).length

    const canceled = orders.filter(order =>
      order.status === 'Cancelado'
    ).length

    return {
      totalOrders,
      revenue,
      inProgress,
      delivered,
      canceled
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const text = `
          ${order._id}
          ${order.customer?.name || ''}
          ${order.customer?.email || ''}
          ${order.customer?.address || ''}
          ${order.customer?.payment || ''}
          ${order.trackingCode || ''}
          ${order.notes || ''}
          ${order.items?.map(item => item.name).join(' ') || ''}
        `.toLowerCase()

        const matchesSearch = text.includes(search.toLowerCase())

        const matchesStatus =
          statusFilter === 'Todos'
            ? true
            : order.status === statusFilter

        const matchesPayment =
          paymentFilter === 'Todos'
            ? true
            : order.customer?.payment === paymentFilter

        return matchesSearch && matchesStatus && matchesPayment
      })
      .sort((a, b) => {
        if (sortFilter === 'mais-antigos') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        }

        if (sortFilter === 'maior-valor') {
          return Number(b.total || 0) - Number(a.total || 0)
        }

        if (sortFilter === 'menor-valor') {
          return Number(a.total || 0) - Number(b.total || 0)
        }

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      })
  }, [orders, search, statusFilter, paymentFilter, sortFilter])

  if (loading) {
    return <h2 className="message">Carregando pedidos...</h2>
  }

  return (
    <section className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <span className="admin-label">Administração</span>
          <h1>Painel de Pedidos</h1>
          <p>
            Acompanhe pedidos, clientes, pagamentos, produtos, rastreio e status de entrega.
          </p>
        </div>

        <button className="btn secondary" type="button" onClick={loadOrders}>
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      <div className="admin-orders-stats">
        <div className="orders-stat-card">
          <PackageCheck />
          <div>
            <span>Total de pedidos</span>
            <strong>{stats.totalOrders}</strong>
          </div>
        </div>

        <div className="orders-stat-card">
          <CreditCard />
          <div>
            <span>Receita válida</span>
            <strong>R$ {stats.revenue.toFixed(2)}</strong>
          </div>
        </div>

        <div className="orders-stat-card warning">
          <Clock />
          <div>
            <span>Em andamento</span>
            <strong>{stats.inProgress}</strong>
          </div>
        </div>

        <div className="orders-stat-card success">
          <CheckCircle />
          <div>
            <span>Entregues</span>
            <strong>{stats.delivered}</strong>
          </div>
        </div>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-orders-toolbar">
        <div className="admin-orders-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar por cliente, e-mail, produto, rastreio ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>Todos</option>
          {statusOptions.map(status => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          {paymentOptions.map(payment => (
            <option key={payment}>{payment}</option>
          ))}
        </select>

        <select
          value={sortFilter}
          onChange={(e) => setSortFilter(e.target.value)}
        >
          <option value="recentes">Mais recentes</option>
          <option value="mais-antigos">Mais antigos</option>
          <option value="maior-valor">Maior valor</option>
          <option value="menor-valor">Menor valor</option>
        </select>

        <button type="button" onClick={clearFilters}>
          Limpar filtros
        </button>
      </div>

      <div className="admin-orders-results">
        <p>
          Mostrando <strong>{filteredOrders.length}</strong> de{' '}
          <strong>{orders.length}</strong> pedidos.
        </p>

        {stats.canceled > 0 && (
          <p>
            Pedidos cancelados: <strong>{stats.canceled}</strong>
          </p>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="admin-orders-empty">
          <ShoppingBag size={42} />
          <h2>Nenhum pedido encontrado</h2>
          <p>Tente limpar os filtros ou aguarde novos pedidos.</p>
        </div>
      ) : (
        <div className="admin-orders-grid">
          {filteredOrders.map(order => {
            const draft = orderDrafts[order._id] || {
              trackingCode: order.trackingCode || '',
              notes: order.notes || ''
            }

            return (
              <div className="admin-order-card" key={order._id}>
                <div className="admin-order-top">
                  <div>
                    <span className="order-code">
                      Pedido #{shortId(order._id)}
                    </span>

                    <h2>
                      R$ {Number(order.total || 0).toFixed(2)}
                    </h2>
                  </div>

                  <div className="order-status-area">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>

                    <select
                      className="status-select"
                      value={order.status || 'Pagamento aprovado'}
                      disabled={updatingId === order._id}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value)
                      }
                    >
                      {statusOptions.map(status => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-order-info-grid">
                  <div className="order-info-card">
                    <User size={18} />
                    <div>
                      <span>Cliente</span>
                      <strong>{order.customer?.name || 'Não informado'}</strong>
                    </div>
                  </div>

                  <div className="order-info-card">
                    <Mail size={18} />
                    <div>
                      <span>E-mail</span>
                      <strong>{order.customer?.email || 'Não informado'}</strong>
                    </div>
                  </div>

                  <div className="order-info-card">
                    <CreditCard size={18} />
                    <div>
                      <span>Pagamento</span>
                      <strong>{order.customer?.payment || 'Não informado'}</strong>
                    </div>
                  </div>

                  <div className="order-info-card">
                    <CalendarDays size={18} />
                    <div>
                      <span>Data</span>
                      <strong>{formatDate(order.createdAt)}</strong>
                    </div>
                  </div>
                </div>

                <div className="order-address">
                  <MapPin size={18} />
                  <div>
                    <span>Endereço de entrega</span>
                    <p>{order.customer?.address || 'Endereço não informado'}</p>
                  </div>
                </div>

                <div className="admin-order-management">
                  <div className="order-management-field">
                    <label>
                      <Hash size={16} />
                      Código de rastreio
                    </label>

                    <input
                      type="text"
                      placeholder="Ex: UW123456ABCDEF"
                      value={draft.trackingCode}
                      onChange={(e) =>
                        updateDraft(order._id, 'trackingCode', e.target.value)
                      }
                    />

                    <small>
                      Ao mudar o status para Enviado, o sistema pode gerar um código automaticamente.
                    </small>
                  </div>

                  <div className="order-management-field full">
                    <label>
                      <FileText size={16} />
                      Observações internas
                    </label>

                    <textarea
                      placeholder="Ex: Cliente pediu atenção ao endereço de entrega."
                      value={draft.notes}
                      maxLength={500}
                      onChange={(e) =>
                        updateDraft(order._id, 'notes', e.target.value)
                      }
                    />

                    <small>
                      {draft.notes.length}/500 caracteres
                    </small>
                  </div>

                  <button
                    type="button"
                    disabled={updatingId === order._id}
                    onClick={() => saveOrderDetails(order)}
                  >
                    <Save size={16} />
                    {updatingId === order._id ? 'Salvando...' : 'Salvar rastreio e observação'}
                  </button>
                </div>

                <div className="admin-order-products">
                  <h3>Produtos do pedido</h3>

                  {order.items?.map((item, index) => (
                    <div
                      className="admin-order-item"
                      key={`${order._id}-${item.productId}-${item.selectedSize}-${index}`}
                    >
                      <img src={item.image} alt={item.name} />

                      <div>
                        <strong>{item.name}</strong>

                        <span>
                          Quantidade: {item.quantity} | Tamanho: {item.selectedSize || 'Não informado'}
                        </span>

                        <small>
                          R$ {Number(item.price || 0).toFixed(2)} cada
                        </small>
                      </div>

                      <strong>
                        R$ {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="admin-order-total">
                  <span>Total do pedido</span>
                  <strong>R$ {Number(order.total || 0).toFixed(2)}</strong>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default AdminOrders