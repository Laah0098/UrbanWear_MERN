import { Link } from 'react-router-dom'
import { ShoppingCart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { cart } = useCart()
  const { user } = useAuth()

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        UrbanWear
      </Link>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/produtos">Categorias</Link>
        <Link to="/favoritos">Favoritos</Link>
        <Link to="/minhas-compras">Compras</Link>

        {user?.role === 'admin' && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin">Produtos</Link>
            <Link to="/admin/pedidos">Pedidos</Link>
            <Link to="/admin/usuarios">Usuários</Link>
          </>
        )}
      </nav>

      <div className="nav-right">
        <Link to={user ? '/perfil' : '/login'}>
          <User />
          {user ? user.name : 'Entrar'}
        </Link>

        <Link to="/carrinho">
          <ShoppingCart />
          ({cart.length})
        </Link>
      </div>
    </header>
  )
}

export default Navbar