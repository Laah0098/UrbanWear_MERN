import { createContext, useContext, useState } from 'react'

const OrdersContext = createContext()

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(
    JSON.parse(localStorage.getItem('orders')) || []
  )

  const addOrder = (order) => {
    const updatedOrders = [...orders, order]

    setOrders(updatedOrders)

    localStorage.setItem(
      'orders',
      JSON.stringify(updatedOrders)
    )
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export const useOrders = () => useContext(OrdersContext)