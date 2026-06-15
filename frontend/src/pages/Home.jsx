import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  CreditCard,
  Sparkles,
  Star,
  PackageCheck,
  ShoppingBag
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get('/products')
        setFeaturedProducts(response.data.slice(0, 4))
      } catch (error) {
        console.log(error)
      }
    }

    loadProducts()
  }, [])

  return (
    <>
      <section className="hero">
        <div>
          <span>Nova coleção 2026</span>

          <h1>Seu estilo começa aqui</h1>

          <p>
            Encontre roupas modernas, confortáveis e cheias de personalidade.
            A UrbanWear combina moda urbana com uma experiência de compra simples.
          </p>

          <div className="hero-actions">
            <Link to="/produtos" className="btn">
              Comprar agora
            </Link>

            {!user ? (
              <Link to="/cadastro" className="btn secondary">
                Criar conta
              </Link>
            ) : (
              <Link to="/perfil" className="btn secondary">
                Meu perfil
              </Link>
            )}
          </div>

          <div className="hero-highlights">
            <span><Star size={16} /> Avaliações de produtos</span>
            <span><PackageCheck size={16} /> Pedidos acompanhados</span>
            <span><ShoppingBag size={16} /> Carrinho inteligente</span>
          </div>
        </div>

        <div className="hero-image-box">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b"
            alt="Moda urbana"
          />

          <div className="floating-card">
            <strong>UrbanWear</strong>
            <p>Moda masculina, feminina e unissex.</p>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div>
          <ShoppingBag />
          <h3>Carrinho funcional</h3>
          <p>Escolha tamanho, quantidade e finalize o pedido.</p>
        </div>

        <div>
          <ShieldCheck />
          <h3>Conta protegida</h3>
          <p>Login com autenticação e área do cliente.</p>
        </div>

        <div>
          <CreditCard />
          <h3>Pagamento simulado</h3>
          <p>Fluxo de checkout para fins acadêmicos.</p>
        </div>

        <div>
          <Sparkles />
          <h3>Moda variada</h3>
          <p>Peças masculinas, femininas e unissex.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h1>Destaques da loja</h1>
            <p>Produtos selecionados para você.</p>
          </div>

          <Link to="/produtos" className="btn secondary">
            Ver todos
          </Link>
        </div>

        <div className="grid">
          {featuredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="promo-banner">
        <div>
          <span>Explore a coleção</span>
          <h1>Monte seu look completo</h1>
          <p>
            Combine camisetas, calças, calçados, vestidos, acessórios e outras peças
            em uma experiência de compra simples e moderna.
          </p>
        </div>

        <Link to="/produtos" className="btn">
          Ver produtos
        </Link>
      </section>

      <section className="categories-home">
        <h1>Compre por categoria</h1>

        <div>
        <Link to="/produtos?categoria=Camisetas">Camisetas</Link>
        <Link to="/produtos?categoria=Moletons">Moletons</Link>
        <Link to="/produtos?categoria=Jaquetas">Jaquetas</Link>
        <Link to="/produtos?categoria=Calças">Calças</Link>
        <Link to="/produtos?categoria=Vestidos">Vestidos</Link>
        <Link to="/produtos?categoria=Calçados">Calçados</Link>
        <Link to="/produtos?categoria=Acessórios">Acessórios</Link>
        </div>
      </section>
    </>
  )
}

export default Home