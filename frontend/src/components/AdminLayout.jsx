import { Link, Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">
        <h2>UrbanWear Admin</h2>

        <Link to="/admin/dashboard">
          Dashboard
        </Link>

        <Link to="/admin">
          Produtos
        </Link>

        <Link to="/admin/pedidos">
          Pedidos
        </Link>

        <Link to="/admin/usuarios">
          Usuários
        </Link>

        <Link to="/">
          Voltar para Loja
        </Link>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>

    </div>
  )
}

export default AdminLayout