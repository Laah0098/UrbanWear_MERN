import { useEffect, useMemo, useState } from 'react'
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  Mail,
  CalendarDays,
  Crown,
  User
} from 'lucide-react'
import api from '../services/api'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [sortFilter, setSortFilter] = useState('recentes')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadUsers() {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      setError('Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  function showTemporaryMessage(text) {
    setMessage(text)

    setTimeout(() => {
      setMessage('')
    }, 3500)
  }

  async function changeStatus(user, status) {
    if (user.role === 'admin') {
      setError('Usuários administradores não podem ser bloqueados por esta tela.')
      return
    }

    if (status === 'bloqueado') {
      const confirmBlock = confirm(
        `Tem certeza que deseja bloquear ${user.name}?`
      )

      if (!confirmBlock) return
    }

    setUpdatingId(user._id)
    setError('')

    try {
      await api.put(`/users/${user._id}/status`, { status })

      setUsers(currentUsers =>
        currentUsers.map(item =>
          item._id === user._id
            ? { ...item, status }
            : item
        )
      )

      showTemporaryMessage(
        status === 'ativo'
          ? 'Usuário ativado com sucesso.'
          : 'Usuário bloqueado com sucesso.'
      )
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Erro ao alterar status do usuário.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  function formatDate(date) {
    if (!date) return 'Data não informada'

    return new Date(date).toLocaleDateString('pt-BR')
  }

  function clearFilters() {
    setSearch('')
    setRoleFilter('Todos')
    setStatusFilter('Todos')
    setSortFilter('recentes')
  }

  const stats = useMemo(() => {
    const totalUsers = users.length

    const totalAdmins = users.filter(user =>
      user.role === 'admin'
    ).length

    const totalActive = users.filter(user =>
      (user.status || 'ativo') === 'ativo'
    ).length

    const totalBlocked = users.filter(user =>
      user.status === 'bloqueado'
    ).length

    return {
      totalUsers,
      totalAdmins,
      totalActive,
      totalBlocked
    }
  }, [users])

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const text = `
          ${user.name || ''}
          ${user.email || ''}
          ${user.role || ''}
          ${user.status || 'ativo'}
        `.toLowerCase()

        const matchesSearch = text.includes(search.toLowerCase())

        const matchesRole =
          roleFilter === 'Todos'
            ? true
            : user.role === roleFilter

        const matchesStatus =
          statusFilter === 'Todos'
            ? true
            : (user.status || 'ativo') === statusFilter

        return matchesSearch && matchesRole && matchesStatus
      })
      .sort((a, b) => {
        if (sortFilter === 'nome') {
          return a.name.localeCompare(b.name)
        }

        if (sortFilter === 'antigos') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        }

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      })
  }, [users, search, roleFilter, statusFilter, sortFilter])

  if (loading) {
    return <h2 className="message">Carregando usuários...</h2>
  }

  return (
    <section className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <span className="admin-label">Administração</span>
          <h1>Usuários cadastrados</h1>
          <p>
            Gerencie clientes, administradores e bloqueios de acesso da UrbanWear.
          </p>
        </div>

        <button className="btn secondary" type="button" onClick={loadUsers}>
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      <div className="admin-users-stats">
        <div className="users-stat-card">
          <Users />
          <div>
            <span>Total de usuários</span>
            <strong>{stats.totalUsers}</strong>
          </div>
        </div>

        <div className="users-stat-card success">
          <UserCheck />
          <div>
            <span>Usuários ativos</span>
            <strong>{stats.totalActive}</strong>
          </div>
        </div>

        <div className="users-stat-card danger">
          <UserX />
          <div>
            <span>Bloqueados</span>
            <strong>{stats.totalBlocked}</strong>
          </div>
        </div>

        <div className="users-stat-card admin">
          <ShieldCheck />
          <div>
            <span>Administradores</span>
            <strong>{stats.totalAdmins}</strong>
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

      <div className="admin-users-toolbar">
        <div className="admin-users-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar por nome, e-mail, tipo ou status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="Todos">Todos os tipos</option>
          <option value="admin">Administradores</option>
          <option value="user">Clientes</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="Todos">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="bloqueado">Bloqueados</option>
        </select>

        <select
          value={sortFilter}
          onChange={(e) => setSortFilter(e.target.value)}
        >
          <option value="recentes">Mais recentes</option>
          <option value="antigos">Mais antigos</option>
          <option value="nome">Nome A-Z</option>
        </select>

        <button type="button" onClick={clearFilters}>
          Limpar filtros
        </button>
      </div>

      <div className="admin-users-results">
        <p>
          Mostrando <strong>{filteredUsers.length}</strong> de{' '}
          <strong>{users.length}</strong> usuários.
        </p>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="admin-users-empty">
          <Users size={42} />
          <h2>Nenhum usuário encontrado</h2>
          <p>Tente limpar os filtros ou aguarde novos cadastros.</p>
        </div>
      ) : (
        <div className="admin-users-grid">
          {filteredUsers.map(user => {
            const currentStatus = user.status || 'ativo'
            const isAdmin = user.role === 'admin'

            return (
              <div className="admin-user-card" key={user._id}>
                <div className={isAdmin ? 'user-avatar admin' : 'user-avatar'}>
                  {isAdmin ? <Crown size={28} /> : <User size={28} />}
                </div>

                <div className="admin-user-info">
                  <div className="admin-user-top">
                    <div>
                      <h3>{user.name}</h3>

                      <span className={isAdmin ? 'role-badge admin' : 'role-badge user'}>
                        {isAdmin ? 'Administrador' : 'Cliente'}
                      </span>
                    </div>

                    <span
                      className={
                        currentStatus === 'ativo'
                          ? 'user-status active'
                          : 'user-status blocked'
                      }
                    >
                      {currentStatus === 'ativo' ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </div>

                  <div className="admin-user-details">
                    <div>
                      <Mail size={17} />
                      <span>{user.email}</span>
                    </div>

                    <div>
                      <CalendarDays size={17} />
                      <span>Cadastrado em {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  <div className="admin-user-actions">
                    {isAdmin ? (
                      <button type="button" disabled>
                        <ShieldCheck size={16} />
                        Admin protegido
                      </button>
                    ) : currentStatus === 'ativo' ? (
                      <button
                        type="button"
                        className="block-btn"
                        disabled={updatingId === user._id}
                        onClick={() => changeStatus(user, 'bloqueado')}
                      >
                        <Lock size={16} />
                        {updatingId === user._id ? 'Alterando...' : 'Bloquear'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="active-btn"
                        disabled={updatingId === user._id}
                        onClick={() => changeStatus(user, 'ativo')}
                      >
                        <Unlock size={16} />
                        {updatingId === user._id ? 'Alterando...' : 'Ativar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default AdminUsers