import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

function ProductCard({ product }) {
  const { toggleFavorite, isFavorite } = useFavorites()

  const favorited = isFavorite(product._id)

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />

      <h3>{product.name}</h3>

      <p>R$ {product.price.toFixed(2)}</p>

      <button
        type="button"
        className={favorited ? 'favorite-card-btn active' : 'favorite-card-btn'}
        onClick={() => toggleFavorite(product)}
      >
        {favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      </button>

      <Link to={`/produto/${product._id}`}>
        Ver detalhes
      </Link>
    </div>
  )
}

export default ProductCard