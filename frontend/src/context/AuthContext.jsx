import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user'))
  )

  async function login(email, password) {
    const response = await api.post('/users/login', {
      email,
      password
    })

    localStorage.setItem('user', JSON.stringify(response.data))
    setUser(response.data)

    return response.data
  }

  async function register(name, email, password) {
    const response = await api.post('/users/register', {
      name,
      email,
      password
    })

    localStorage.setItem('user', JSON.stringify(response.data))
    setUser(response.data)

    return response.data
  }

  function logout() {
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)