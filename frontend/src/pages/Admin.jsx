import { useEffect, useMemo, useState } from 'react'
import {
  Package,
  AlertTriangle,
  XCircle,
  PlusCircle,
  Save,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  ImageIcon,
  Eraser
} from 'lucide-react'
import api from '../services/api'

function Admin() {
  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [stockFilter, setStockFilter] = useState('Todos')
  const [sortFilter, setSortFilter] = useState('recentes')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: '',
    sizes: ''
  })

  const defaultCategories = [
    'Camisetas',
    'Moletons',
    'Jaquetas',
    'Calças',
    'Vestidos',
    'Calçados',
    'Acessórios',
    'Blusas',
    'Saias'
  ]

  async function loadProducts() {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      setError('Erro ao carregar produtos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  function showTemporaryMessage(text) {
    setMessage(text)

    setTimeout(() => {
      setMessage('')
    }, 3500)
  }

  function handleChange(e) {
    const { name, value } = e.target

    let newValue = value

    if (name === 'price') {
      newValue = value.replace(',', '.')
    }

    if (name === 'stock') {
      newValue = value.replace(/\D/g, '')
    }

    setForm({
      ...form,
      [name]: newValue
    })
  }

  function resetForm() {
    setEditingId(null)
    setError('')

    setForm({
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
      stock: '',
      sizes: ''
    })
  }

  function editProduct(product) {
    setEditingId(product._id)
    setError('')
    setMessage('')

    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      image: product.image || '',
      category: product.category || '',
      stock: product.stock || '',
      sizes: product.sizes?.join(', ') || ''
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validateForm() {
    if (form.name.trim().length < 3) {
      return 'O nome do produto deve ter pelo menos 3 caracteres.'
    }

    if (form.description.trim().length < 10) {
      return 'A descrição deve ter pelo menos 10 caracteres.'
    }

    if (Number(form.price) <= 0) {
      return 'O preço precisa ser maior que zero.'
    }

    if (!form.image.trim().startsWith('http') && !form.image.trim().startsWith('/')) {
      return 'A imagem precisa ser uma URL válida ou um caminho iniciado com /.'
    }

    if (!form.category.trim()) {
      return 'Selecione ou digite uma categoria.'
    }

    if (form.stock === '' || Number(form.stock) < 0) {
      return 'O estoque não pode ser vazio ou negativo.'
    }

    return ''
  }

  function formatSizes() {
    const sizesArray = form.sizes
      ? form.sizes.split(',').map(size => size.trim()).filter(Boolean)
      : ['P', 'M', 'G', 'GG']

    return [...new Set(sizesArray)]
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image: form.image.trim(),
      category: form.category.trim(),
      stock: Number(form.stock),
      sizes: formatSizes()
    }

    setSaving(true)

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, productData)
        showTemporaryMessage('Produto atualizado com sucesso.')
      } else {
        await api.post('/products', productData)
        showTemporaryMessage('Produto cadastrado com sucesso.')
      }

      resetForm()
      await loadProducts()
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Erro ao salvar produto.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(product) {
    const confirmDelete = confirm(
      `Tem certeza que deseja excluir "${product.name}"?`
    )

    if (!confirmDelete) return

    try {
      await api.delete(`/products/${product._id}`)
      showTemporaryMessage('Produto excluído com sucesso.')
      await loadProducts()
    } catch (error) {
      setError('Erro ao excluir produto.')
    }
  }

  function clearFilters() {
    setSearch('')
    setCategoryFilter('Todos')
    setStockFilter('Todos')
    setSortFilter('recentes')
  }

  const categories = [
    'Todos',
    ...new Set([
      ...defaultCategories,
      ...products.map(product => product.category).filter(Boolean)
    ])
  ]

  const stats = useMemo(() => {
    const totalStock = products.reduce((acc, product) => acc + Number(product.stock || 0), 0)
    const lowStock = products.filter(product => Number(product.stock) > 0 && Number(product.stock) <= 5).length
    const outOfStock = products.filter(product => Number(product.stock) === 0).length
    const totalValue = products.reduce((acc, product) => {
      return acc + Number(product.price || 0) * Number(product.stock || 0)
    }, 0)

    return {
      totalProducts: products.length,
      totalStock,
      lowStock,
      outOfStock,
      totalValue
    }
  }, [products])

  const filteredProducts = products
    .filter(product => {
      const text = `${product.name} ${product.description} ${product.category}`.toLowerCase()

      const matchesSearch = text.includes(search.toLowerCase())

      const matchesCategory =
        categoryFilter === 'Todos'
          ? true
          : product.category === categoryFilter

      const matchesStock =
        stockFilter === 'Baixo estoque'
          ? Number(product.stock) > 0 && Number(product.stock) <= 5
          : stockFilter === 'Sem estoque'
            ? Number(product.stock) === 0
            : stockFilter === 'Disponível'
              ? Number(product.stock) > 0
              : true

      return matchesSearch && matchesCategory && matchesStock
    })
    .sort((a, b) => {
      if (sortFilter === 'menor-preco') return a.price - b.price
      if (sortFilter === 'maior-preco') return b.price - a.price
      if (sortFilter === 'menor-estoque') return a.stock - b.stock
      if (sortFilter === 'maior-estoque') return b.stock - a.stock
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

  if (loading) {
    return <h2 className="message">Carregando produtos...</h2>
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-label">Administração</span>
          <h1>Painel de Produtos</h1>
          <p>Cadastre, edite, filtre e acompanhe o estoque da UrbanWear.</p>
        </div>

        <button className="btn secondary" type="button" onClick={loadProducts}>
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <Package />
          <div>
            <span>Total de produtos</span>
            <strong>{stats.totalProducts}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <Package />
          <div>
            <span>Itens em estoque</span>
            <strong>{stats.totalStock}</strong>
          </div>
        </div>

        <div className="admin-stat-card warning">
          <AlertTriangle />
          <div>
            <span>Baixo estoque</span>
            <strong>{stats.lowStock}</strong>
          </div>
        </div>

        <div className="admin-stat-card danger">
          <XCircle />
          <div>
            <span>Sem estoque</span>
            <strong>{stats.outOfStock}</strong>
          </div>
        </div>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-product-form">
        <div className="admin-form-header">
          <div>
            <h2>
              {editingId ? 'Editar Produto' : 'Cadastrar Produto'}
            </h2>
            <p>
              Preencha os dados do produto que aparecerá na loja.
            </p>
          </div>

          {editingId ? (
            <span className="edit-badge">Editando</span>
          ) : (
            <span className="create-badge">Novo produto</span>
          )}
        </div>

        <div className="admin-form-grid">
          <div className="form-group">
            <label>Nome do produto</label>
            <input
              name="name"
              placeholder="Ex: Vestido Floral Midi"
              value={form.name}
              onChange={handleChange}
              maxLength={80}
              required
            />
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <input
              name="category"
              placeholder="Ex: Vestidos"
              list="category-options"
              value={form.category}
              onChange={handleChange}
              maxLength={40}
              required
            />

            <datalist id="category-options">
              {defaultCategories.map(category => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label>Preço</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 149.90"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Estoque</label>
            <input
              name="stock"
              type="number"
              min="0"
              placeholder="Ex: 12"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full">
            <label>URL da imagem</label>
            <input
              name="image"
              placeholder="Ex: https://images.unsplash.com/..."
              value={form.image}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full">
            <label>Descrição</label>
            <textarea
              name="description"
              placeholder="Descreva o produto..."
              value={form.description}
              onChange={handleChange}
              maxLength={300}
              required
            />
          </div>

          <div className="form-group full">
            <label>Tamanhos</label>
            <input
              name="sizes"
              placeholder="Ex: P, M, G, GG ou 35, 36, 37, 38"
              value={form.sizes}
              onChange={handleChange}
            />
          </div>
        </div>

        {form.image ? (
          <div className="admin-image-preview">
            <img src={form.image} alt="Prévia do produto" />
            <div>
              <strong>Prévia da imagem</strong>
              <p>Confira se a imagem está carregando corretamente antes de salvar.</p>
            </div>
          </div>
        ) : (
          <div className="admin-image-empty">
            <ImageIcon />
            <p>A prévia da imagem aparecerá aqui.</p>
          </div>
        )}

        <div className="admin-actions-row">
          <button className="btn" type="submit" disabled={saving}>
            {editingId ? <Save size={18} /> : <PlusCircle size={18} />}
            {saving
              ? 'Salvando...'
              : editingId
                ? 'Salvar alterações'
                : 'Cadastrar produto'}
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={resetForm}
          >
            <Eraser size={18} />
            Limpar
          </button>
        </div>
      </form>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, descrição ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option>Todos</option>
          <option>Disponível</option>
          <option>Baixo estoque</option>
          <option>Sem estoque</option>
        </select>

        <select
          value={sortFilter}
          onChange={(e) => setSortFilter(e.target.value)}
        >
          <option value="recentes">Mais recentes</option>
          <option value="menor-preco">Menor preço</option>
          <option value="maior-preco">Maior preço</option>
          <option value="menor-estoque">Menor estoque</option>
          <option value="maior-estoque">Maior estoque</option>
        </select>

        <button type="button" onClick={clearFilters}>
          Limpar filtros
        </button>
      </div>

      <div className="admin-results-info">
        <p>
          Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> produtos.
        </p>

        <p>
          Valor estimado em estoque: <strong>R$ {stats.totalValue.toFixed(2)}</strong>
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="admin-empty">
          <Package size={42} />
          <h2>Nenhum produto encontrado</h2>
          <p>Tente limpar os filtros ou cadastrar um novo produto.</p>
        </div>
      ) : (
        <div className="admin-products-grid">
          {filteredProducts.map(product => (
            <div className="admin-product-card" key={product._id}>
              <img src={product.image} alt={product.name} />

              <div className="admin-product-info">
                <div className="admin-product-top">
                  <span>{product.category}</span>

                  <small
                    className={
                      product.stock === 0
                        ? 'stock-badge danger'
                        : product.stock <= 5
                          ? 'stock-badge warning'
                          : 'stock-badge success'
                    }
                  >
                    {product.stock === 0
                      ? 'Sem estoque'
                      : product.stock <= 5
                        ? 'Baixo estoque'
                        : 'Disponível'}
                  </small>
                </div>

                <h3>{product.name}</h3>

                <p>{product.description}</p>

                <div className="admin-product-meta">
                  <span>Estoque: <strong>{product.stock}</strong></span>
                  <span>Tamanhos: <strong>{product.sizes?.join(', ')}</strong></span>
                </div>

                <strong className="admin-price">
                  R$ {Number(product.price).toFixed(2)}
                </strong>

                <div className="admin-card-actions">
                  <button type="button" onClick={() => editProduct(product)}>
                    <Pencil size={16} />
                    Editar
                  </button>

                  <button type="button" onClick={() => deleteProduct(product)}>
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Admin