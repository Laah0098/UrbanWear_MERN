import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import { fakeProducts } from '../data/products'

function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [searchParams, setSearchParams] = useSearchParams()

  const selectedCategory = searchParams.get('categoria') || 'Todos'

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get('/products')

        if (response.data.length > 0) {
          setProducts(response.data)
        } else {
          setProducts(fakeProducts)
        }
      } catch {
        setProducts(fakeProducts)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = [
    'Todos',
    ...new Set(products.map(product => product.category))
  ]

  function handleCategory(cat) {
    if (cat === 'Todos') {
      setSearchParams({})
    } else {
      setSearchParams({ categoria: cat })
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === 'Todos'
        ? true
        : product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <h2 className="message">Carregando produtos...</h2>
  }

  return (
    <section className="section">
      <h1>Produtos</h1>

      <input
        type="text"
        placeholder="Buscar produto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => handleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="message">
          Nenhum produto encontrado nessa categoria.
        </p>
      ) : (
        <div className="grid">
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Products