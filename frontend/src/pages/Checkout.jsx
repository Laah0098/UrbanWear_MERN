import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrdersContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Checkout() {
  const { cart, total, clearCart } = useCart()
  const { addOrder } = useOrders()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    payment: 'Cartão',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <section className="section empty">
        <h1>Faça login para finalizar a compra</h1>
        <p>Você precisa estar logado para salvar o pedido no sistema.</p>
        <Link to="/login" className="btn">Entrar</Link>
      </section>
    )
  }

  if (cart.length === 0) {
    return (
      <section className="section empty">
        <h1>Seu carrinho está vazio</h1>
        <p>Adicione produtos antes de finalizar a compra.</p>
        <Link to="/produtos" className="btn">Ver produtos</Link>
      </section>
    )
  }

  function onlyLetters(value) {
    return value.replace(/[^A-Za-zÀ-ÿ\s]/g, '')
  }

  function onlyNumbers(value) {
    return value.replace(/\D/g, '')
  }

  function handleChange(e) {
    const { name, value } = e.target

    let newValue = value

    if (name === 'name') {
      newValue = onlyLetters(value).slice(0, 60)
    }

    if (name === 'cep') {
      newValue = onlyNumbers(value).slice(0, 8)
    }

    if (name === 'number') {
      newValue = onlyNumbers(value).slice(0, 6)
    }

    if (name === 'state') {
      newValue = onlyLetters(value).toUpperCase().slice(0, 2)
    }

    if (name === 'city' || name === 'neighborhood') {
      newValue = onlyLetters(value).slice(0, 50)
    }

    if (name === 'street') {
      newValue = value.slice(0, 80)
    }

    if (name === 'complement') {
      newValue = value.slice(0, 50)
    }

    if (name === 'cardNumber') {
      newValue = onlyNumbers(value).slice(0, 16)
    }

    if (name === 'cardExpiry') {
      const numbers = onlyNumbers(value).slice(0, 4)
      newValue =
        numbers.length > 2
          ? `${numbers.slice(0, 2)}/${numbers.slice(2)}`
          : numbers
    }

    if (name === 'cardCvv') {
      newValue = onlyNumbers(value).slice(0, 3)
    }

    setForm({
      ...form,
      [name]: newValue
    })
  }

  function validateForm() {
    if (form.name.trim().length < 3) {
      return 'Informe um nome válido.'
    }

    if (!form.email.includes('@') || form.email.length > 80) {
      return 'Informe um e-mail válido.'
    }

    if (form.cep.length !== 8) {
      return 'O CEP deve ter 8 números.'
    }

    if (form.street.trim().length < 3) {
      return 'Informe a rua corretamente.'
    }

    if (form.number.length < 1) {
      return 'Informe o número da residência.'
    }

    if (form.neighborhood.trim().length < 3) {
      return 'Informe o bairro corretamente.'
    }

    if (form.city.trim().length < 3) {
      return 'Informe a cidade corretamente.'
    }

    if (form.state.length !== 2) {
      return 'Informe o estado com 2 letras. Ex: SP.'
    }

    if (form.payment === 'Cartão') {
      if (form.cardNumber.length !== 16) {
        return 'O cartão fictício deve ter 16 números.'
      }

      if (form.cardExpiry.length !== 5) {
        return 'Informe a validade no formato MM/AA.'
      }

      if (form.cardCvv.length !== 3) {
        return 'O CVV deve ter 3 números.'
      }
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

    const fullAddress = `${form.street}, ${form.number} - ${form.neighborhood}, ${form.city}/${form.state}, CEP ${form.cep}${
      form.complement ? ` - ${form.complement}` : ''
    }`

    const orderData = {
      customer: {
        name: form.name,
        email: form.email,
        address: fullAddress,
        payment: form.payment
      },
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize
      })),
      total,
      status: 'Pagamento aprovado'
    }

    try {
      const response = await api.post('/orders', orderData)

      addOrder(response.data)
      localStorage.setItem('lastOrder', JSON.stringify(response.data))

      clearCart()
      navigate('/pagamento-aprovado')
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Erro ao salvar pedido no banco.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section">
      <h1>Finalizar pedido</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form className="checkout checkout-grid" onSubmit={handleSubmit}>
        <div className="checkout-block">
          <h2>Dados do cliente</h2>

          <input
            name="name"
            placeholder="Nome completo"
            value={form.name}
            onChange={handleChange}
            maxLength={60}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            maxLength={80}
            required
          />
        </div>

        <div className="checkout-block">
          <h2>Endereço de entrega</h2>

          <input
            name="cep"
            placeholder="CEP - somente números"
            value={form.cep}
            onChange={handleChange}
            maxLength={8}
            required
          />

          <input
            name="street"
            placeholder="Rua / Avenida"
            value={form.street}
            onChange={handleChange}
            maxLength={80}
            required
          />

          <input
            name="number"
            placeholder="Número"
            value={form.number}
            onChange={handleChange}
            maxLength={6}
            required
          />

          <input
            name="neighborhood"
            placeholder="Bairro"
            value={form.neighborhood}
            onChange={handleChange}
            maxLength={50}
            required
          />

          <input
            name="city"
            placeholder="Cidade"
            value={form.city}
            onChange={handleChange}
            maxLength={50}
            required
          />

          <input
            name="state"
            placeholder="Estado - Ex: SP"
            value={form.state}
            onChange={handleChange}
            maxLength={2}
            required
          />

          <input
            name="complement"
            placeholder="Complemento (opcional)"
            value={form.complement}
            onChange={handleChange}
            maxLength={50}
          />
        </div>

        <div className="checkout-block">
          <h2>Pagamento simulado</h2>

          <select
            name="payment"
            value={form.payment}
            onChange={handleChange}
          >
            <option>Cartão</option>
            <option>Pix</option>
            <option>Boleto</option>
          </select>

          {form.payment === 'Cartão' && (
            <>
              <input
                name="cardNumber"
                placeholder="Número do cartão fictício"
                value={form.cardNumber}
                onChange={handleChange}
                maxLength={16}
                required
              />

              <input
                name="cardExpiry"
                placeholder="Validade MM/AA"
                value={form.cardExpiry}
                onChange={handleChange}
                maxLength={5}
                required
              />

              <input
                name="cardCvv"
                placeholder="CVV"
                value={form.cardCvv}
                onChange={handleChange}
                maxLength={3}
                required
              />
            </>
          )}

          {form.payment === 'Pix' && (
            <div className="fake-payment">
              Pix fictício: 00020126580014BR.GOV.BCB.PIX.URBANWEAR
            </div>
          )}

          {form.payment === 'Boleto' && (
            <div className="fake-payment">
              Boleto fictício: 34191.79001 01043.510047 91020.150008
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h2>Resumo</h2>

          {cart.map(item => (
            <div key={item.cartKey || item._id} className="checkout-item">
              <span>
                {item.name} ({item.quantity}x)
              </span>

              <strong>
                R$ {(item.price * item.quantity).toFixed(2)}
              </strong>
            </div>
          ))}

          <h2>Total: R$ {total.toFixed(2)}</h2>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar pagamento'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default Checkout