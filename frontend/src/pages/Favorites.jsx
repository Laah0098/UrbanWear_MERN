import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useFavorites } from '../context/FavoritesContext'

function Favorites() {
  const { favorites } = useFavorites()

  if (favorites.length === 0) {
    return (
      <section className="section empty">
        <h1>Nenhum favorito ainda</h1>
        <p>Favorite produtos para encontrar depois.</p>
        <Link to="/produtos" className="btn">Ver produtos</Link>
      </section>
    )
  }

  return (
    <section className="section">
      <h1>Meus favoritos</h1>

      <div className="grid">
        {favorites.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default Favorites