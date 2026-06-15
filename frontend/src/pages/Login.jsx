import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target

    let newValue = value

    if (name === 'email') {
      newValue = value
        .toLowerCase()
        .replace(/\s/g, '')
        .slice(0, 80)
    }

    if (name === 'password') {
      newValue = value.slice(0, 30)
    }

    setForm({
      ...form,
      [name]: newValue
    })
  }

  function validateForm() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(form.email)) {
      return 'Digite um e-mail válido.'
    }

    if (form.password.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres.'
    }

    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const user = await login(form.email, form.password)

      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/perfil')
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 'Erro ao fazer login.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Entrar</h1>
        <p>Acesse sua conta UrbanWear.</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <input
          name="email"
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          maxLength={80}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          maxLength={30}
          required
        />

        <small>
          Use seu e-mail cadastrado e uma senha de 6 a 30 caracteres.
        </small>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <span>
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </span>
      </form>
    </section>
  )
}

export default Login