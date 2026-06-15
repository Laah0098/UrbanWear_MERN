import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedAdminRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedAdminRoute