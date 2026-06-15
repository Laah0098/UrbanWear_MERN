const express = require('express')
const router = express.Router()

const Review = require('../models/Review')
const { protect } = require('../middleware/authMiddleware')

// Listar avaliações de um produto
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId
    }).sort({ createdAt: -1 })

    const totalReviews = reviews.length

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews

    res.json({
      reviews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1))
    })
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao buscar avaliações'
    })
  }
})

// Criar avaliação
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        message: 'Preencha nota e comentário.'
      })
    }

    const reviewExists = await Review.findOne({
      productId,
      userId: req.user._id
    })

    if (reviewExists) {
      return res.status(400).json({
        message: 'Você já avaliou este produto.'
      })
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      userName: req.user.name,
      rating,
      comment
    })

    res.status(201).json(review)
  } catch (error) {
    res.status(400).json({
      message: 'Erro ao criar avaliação.'
    })
  }
})

module.exports = router