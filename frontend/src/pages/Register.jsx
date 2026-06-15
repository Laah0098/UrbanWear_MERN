import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function onlyLetters(value) {
    return value.replace(/[^A-Za-zÀ-ÿ\s]/g, '')
  }

  function handleChange(e) {
    const { name, value } = e.target

    let newValue = value

    if (name === 'name') {
      newValue = onlyLetters(value)
        .replace(/\s{2,}/g, ' ')
        .slice(0, 60)
    }

    if (name === 'email') {
      newValue = value
        .toLowerCase()
        .replace(/\s/g, '')
        .slice(0, 80)
    }

    if (name === 'password' || name === 'confirmPassword') {
      newValue = value.replace(/\s/g, '').slice(0, 30)
    }

    setForm({
      ...form,
      [name]: newValue
    })
  }

  function getPasswordStrength() {
    let score = 0

    if (form.password.length >= 6) score++
    if (/[A-Z]/.test(form.password)) score++
    if (/[0-9]/.test(form.password)) score++
    if (/[^A-Za-z0-9]/.test(form.password)) score++

    if (score <= 1) return 'fraca'
    if (score <= 3) return 'média'
    return 'forte'
  }

  function validateForm() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const nameParts = form.name.trim().split(' ').filter(Boolean)

    if (nameParts.length < 2) {
      return 'Digite nome e sobrenome.'
    }

    if (form.name.trim().length < 6) {
      return 'O nome completo deve ter pelo menos 6 caracteres.'
    }

    if (!emailRegex.test(form.email)) {
      return 'Digite um e-mail válido.'
    }

    if (!/[A-Za-z]/.test(form.password)) {
      return 'A senha deve conter pelo menos uma letra.'
    }

    if (!/[0-9]/.test(form.password)) {
      return 'A senha deve conter pelo menos um número.'
    }

    if (form.password.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres.'
    }

    if (form.password !== form.confirmPassword) {
      return 'As senhas não coincidem.'
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
      await register(
        form.name.trim(),
        form.email,
        form.password
      )

      navigate('/perfil')
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Erro ao criar conta.'
      )
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength()

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>

        <p>
          Cadastre-se para acompanhar suas compras e seus pedidos.
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <label>Nome completo</label>

        <input
          name="name"
          placeholder="Ex: Maria Silva"
          value={form.name}
          onChange={handleChange}
          maxLength={60}
          required
        />

        <small className="field-hint">
          Digite nome e sobrenome. Apenas letras são aceitas.
        </small>

        <label>E-mail</label>

        <input
          name="email"
          type="email"
          placeholder="exemplo@email.com"
          value={form.email}
          onChange={handleChange}
          maxLength={80}
          required
        />

        <small className="field-hint">
          Use um e-mail válido. Exemplo: nome@email.com
        </small>

        <label>Senha</label>

        <div className="password-field">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            maxLength={30}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {form.password && (
          <div className={`password-strength ${passwordStrength}`}>
            Força da senha: {passwordStrength}
          </div>
        )}

        <small className="field-hint">
          A senha deve ter 6 a 30 caracteres, pelo menos uma letra e um número.
        </small>

        <label>Confirmar senha</label>

        <div className="password-field">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Digite a senha novamente"
            value={form.confirmPassword}
            onChange={handleChange}
            minLength={6}
            maxLength={30}
            required
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {passwordsMatch && (
          <div className="password-match">
            <CheckCircle size={16} />
            Senhas coincidem
          </div>
        )}

        <button
          className="btn"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <span>
          Já tem conta? <Link to="/login">Entrar</Link>
        </span>
      </form>
    </section>
  )
}

export default Register