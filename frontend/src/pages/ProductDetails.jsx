import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShoppingCart, CheckCircle } from 'lucide-react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { fakeProducts } from '../data/products'

function ProductDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cartMessage, setCartMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')

  async function loadReviews() {
    try {
      const response = await api.get(`/reviews/product/${id}`)
      setReviews(response.data.reviews)
      setAverageRating(response.data.averageRating)
      setTotalReviews(response.data.totalReviews)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct(response.data)
        setSelectedSize('')
      } catch {
        const found = fakeProducts.find(p => p._id === id)
        setProduct(found)
        setSelectedSize('')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
    loadReviews()
  }, [id])

  function handleAddToCart() {
    if (!selectedSize) {
      setCartMessage('Escolha um tamanho antes de adicionar ao carrinho.')
      return
    }

    addToCart({
      ...product,
      selectedSize,
      quantityToAdd: quantity
    })

    setCartMessage('Produto adicionado ao carrinho.')
  }

  function increaseQuantity() {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault()

    setReviewError('')
    setReviewMessage('')

    if (comment.trim().length < 3) {
      setReviewError('O comentário precisa ter pelo menos 3 caracteres.')
      return
    }

    try {
      await api.post('/reviews', {
        productId: id,
        rating: Number(rating),
        comment: comment.trim()
      })

      setComment('')
      setRating(5)
      setReviewMessage('Avaliação enviada com sucesso.')
      loadReviews()
    } catch (error) {
      setReviewError(
        error.response?.data?.message ||
        'Erro ao enviar avaliação.'
      )
    }
  }

  if (loading) {
    return <h2 className="message">Carregando produto...</h2>
  }

  if (!product) {
    return (
      <section className="section empty">
        <h1>Produto não encontrado</h1>
        <Link to="/produtos" className="btn">Voltar</Link>
      </section>
    )
  }

  const stockAvailable = product.stock > 0

  return (
    <>
      <section className="product-details">
        <img src={product.image} alt={product.name} />

        <div>
          <span>{product.category}</span>

          <h1>{product.name}</h1>

          <div className="rating-summary">
            <strong>⭐ {averageRating}</strong>
            <span>({totalReviews} avaliações)</span>
          </div>

          <h2>R$ {product.price.toFixed(2)}</h2>

          <p>{product.description}</p>

          <p>
            <strong>Estoque:</strong>{' '}
            {stockAvailable ? `${product.stock} unidades` : 'Indisponível'}
          </p>

          <h3>Escolha o tamanho / numeração</h3>

          <div className="size-selector">
            {product.sizes.map(size => (
              <button
                key={size}
                type="button"
                className={selectedSize === size ? 'active' : ''}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <h3>Quantidade</h3>

          <div className="product-quantity">
            <button type="button" onClick={decreaseQuantity}>
              -
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>

          {cartMessage && (
            <div
              className={
                cartMessage.includes('adicionado')
                  ? 'success-message'
                  : 'error-message'
              }
            >
              {cartMessage}
            </div>
          )}

          <button
            className="btn product-cart-btn"
            onClick={handleAddToCart}
            disabled={!stockAvailable}
          >
            {stockAvailable ? (
              <>
                <ShoppingCart size={18} />
                Adicionar ao carrinho
              </>
            ) : (
              'Produto indisponível'
            )}
          </button>
        </div>
      </section>

      <section className="section reviews-section">
        <div className="reviews-header">
          <div>
            <h1>Avaliações</h1>
            <p>
              Média: <strong>⭐ {averageRating}</strong> com {totalReviews} avaliação(ões).
            </p>
          </div>
        </div>

        <div className="reviews-layout">
          {user ? (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <h2>Deixe sua avaliação</h2>

              {reviewError && (
                <div className="error-message">
                  {reviewError}
                </div>
              )}

              {reviewMessage && (
                <div className="success-message">
                  {reviewMessage}
                </div>
              )}

              <label>Nota</label>

              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="5">⭐⭐⭐⭐⭐ - Excelente</option>
                <option value="4">⭐⭐⭐⭐ - Muito bom</option>
                <option value="3">⭐⭐⭐ - Bom</option>
                <option value="2">⭐⭐ - Regular</option>
                <option value="1">⭐ - Ruim</option>
              </select>

              <label>Comentário</label>

              <textarea
                placeholder="Escreva sua opinião sobre o produto..."
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 300))}
                maxLength={300}
                required
              />

              <small>{comment.length}/300 caracteres</small>

              <button className="btn" type="submit">
                Enviar avaliação
              </button>
            </form>
          ) : (
            <div className="review-form">
              <h2>Avalie este produto</h2>
              <p>
                <Link to="/login">Entre na sua conta</Link> para enviar uma avaliação.
              </p>
            </div>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="review-card">
                <p>Este produto ainda não possui avaliações.</p>
              </div>
            ) : (
              reviews.map(review => (
                <div className="review-card" key={review._id}>
                  <div className="review-top">
                    <div>
                      <h3>{review.userName}</h3>
                      <small>
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </small>
                    </div>

                    <span>
                      {'⭐'.repeat(review.rating)}
                    </span>
                  </div>

                  <p>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default ProductDetails