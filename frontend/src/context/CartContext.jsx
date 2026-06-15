import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem('cart')) || []
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  function addToCart(product) {
    const size = product.selectedSize
    const quantityToAdd = product.quantityToAdd || 1

    if (!size) return

    const key = `${product._id}-${size}`
    const exists = cart.find(item => item.cartKey === key)

    if (exists) {
      setCart(cart.map(item =>
        item.cartKey === key
          ? {
              ...item,
              quantity: item.quantity + quantityToAdd
            }
          : item
      ))
    } else {
      setCart([
        ...cart,
        {
          ...product,
          selectedSize: size,
          quantity: quantityToAdd,
          cartKey: key
        }
      ])
    }
  }

  function removeFromCart(cartKey) {
    setCart(cart.filter(item => item.cartKey !== cartKey))
  }

  function updateQuantity(cartKey, quantity) {
    if (quantity < 1) return

    setCart(cart.map(item =>
      item.cartKey === cartKey
        ? { ...item, quantity }
        : item
    ))
  }

  function clearCart() {
    setCart([])
  }

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const totalItems = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)