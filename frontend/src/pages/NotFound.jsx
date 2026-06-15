import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!user) {
    return (
      <section className="section empty">
        <h1>Você não está logado</h1>
        <p>Entre ou crie uma conta para acessar seu perfil.</p>
        <Link to="/login" className="btn">Entrar</Link>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="profile-card">
        <h1>Meu perfil</h1>

        <p><strong>Nome:</strong> {user.name}</p>
        <p><strong>E-mail:</strong> {user.email}</p>

        <div className="profile-actions">
          <Link to="/minhas-compras" className="btn">
            Minhas compras
          </Link>

          <button onClick={handleLogout} className="btn secondary">
            Sair
          </button>
        </div>
      </div>
    </section>
  )
}

export default Profile