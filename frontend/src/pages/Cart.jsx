import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'

function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart()

  if (cart.length === 0) {
    return (
      <section className="section empty">
        <h1>Seu carrinho está vazio</h1>
        <p>Adicione produtos para continuar a compra.</p>
        <Link to="/produtos" className="btn">Ver produtos</Link>
      </section>
    )
  }

  return (
    <section className="section">
      <h1>Carrinho</h1>

      <div className="cart-list">
        {cart.map(item => (
          <div className="cart-item" key={item.cartKey}>
            <img src={item.image} alt={item.name} />

            <div>
              <h3>{item.name}</h3>
              <p>Tamanho: {item.selectedSize}</p>

              <div className="quantity">
                <button onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}>
                  -
                </button>

                <span>{item.quantity}</span>

                <button onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}>
                  +
                </button>
              </div>

              <strong>
                Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
              </strong>
            </div>

            <button onClick={() => removeFromCart(item.cartKey)}>
              <Trash2 />
            </button>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <h2>Total: R$ {total.toFixed(2)}</h2>
        <Link to="/checkout" className="btn">Finalizar compra</Link>
      </div>
    </section>
  )
}

export default Cart