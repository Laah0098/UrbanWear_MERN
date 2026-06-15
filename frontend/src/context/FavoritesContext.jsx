import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  const { user } = useAuth()

  const userKey = user?._id || user?.id || user?.email || 'visitante'
  const storageKey = `favorites_${userKey}`

  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem(storageKey)) || []
    setFavorites(savedFavorites)
  }, [storageKey])

  function toggleFavorite(product) {
    setFavorites(currentFavorites => {
      const exists = currentFavorites.find(item => item._id === product._id)

      let updatedFavorites

      if (exists) {
        updatedFavorites = currentFavorites.filter(item => item._id !== product._id)
      } else {
        updatedFavorites = [...currentFavorites, product]
      }

      localStorage.setItem(storageKey, JSON.stringify(updatedFavorites))

      return updatedFavorites
    })
  }

  function isFavorite(id) {
    return favorites.some(item => item._id === id)
  }

  function clearFavorites() {
    setFavorites([])
    localStorage.removeItem(storageKey)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)