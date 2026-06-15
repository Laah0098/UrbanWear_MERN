const express = require('express')
const router = express.Router()

const Product = require('../models/Product')
const { protect, adminOnly } = require('../middleware/authMiddleware')

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao buscar produtos'
    })
  }
})

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        message: 'Produto não encontrado'
      })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao buscar produto'
    })
  }
})

// Criar produto (ADMIN)
router.post(
  '/',
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const product = await Product.create(req.body)

      res.status(201).json(product)
    } catch (error) {
      res.status(400).json({
        message: 'Erro ao criar produto',
        error
      })
    }
  }
)

// Atualizar produto (ADMIN)
router.put(
  '/:id',
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        )

      if (!product) {
        return res.status(404).json({
          message: 'Produto não encontrado'
        })
      }

      res.json(product)
    } catch (error) {
      res.status(400).json({
        message: 'Erro ao atualizar produto'
      })
    }
  }
)

// Excluir produto (ADMIN)
router.delete(
  '/:id',
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        )

      if (!product) {
        return res.status(404).json({
          message: 'Produto não encontrado'
        })
      }

      res.json({
        message: 'Produto excluído com sucesso'
      })
    } catch (error) {
      res.status(500).json({
        message: 'Erro ao excluir produto'
      })
    }
  }
)

module.exports = router