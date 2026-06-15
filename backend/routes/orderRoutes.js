const express = require('express')
const router = express.Router()

const Order = require('../models/Order')
const Product = require('../models/Product')
const { protect, adminOnly } = require('../middleware/authMiddleware')

function generateTrackingCode() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const date = Date.now().toString().slice(-6)

  return `UW${date}${random}`
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const allowedStatus = [
  'Pagamento aprovado',
  'Em separação',
  'Enviado',
  'Entregue',
  'Cancelado'
]

const allowedPayments = [
  'Cartão',
  'Pix',
  'Boleto'
]

// Criar pedido - usuário logado
router.post('/', protect, async (req, res) => {
  try {
    const { customer, items } = req.body

    if (!customer) {
      return res.status(400).json({
        message: 'Dados do cliente são obrigatórios.'
      })
    }

    if (!customer.name || !customer.email || !customer.address || !customer.payment) {
      return res.status(400).json({
        message: 'Preencha todos os dados do cliente.'
      })
    }

    if (!isValidEmail(customer.email)) {
      return res.status(400).json({
        message: 'E-mail inválido.'
      })
    }

    if (!allowedPayments.includes(customer.payment)) {
      return res.status(400).json({
        message: 'Forma de pagamento inválida.'
      })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'O pedido precisa ter pelo menos um produto.'
      })
    }

    const orderItems = []
    let total = 0

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          message: 'Produto inválido no carrinho.'
        })
      }

      if (!item.quantity || Number(item.quantity) <= 0) {
        return res.status(400).json({
          message: 'Quantidade inválida no carrinho.'
        })
      }

      if (!item.selectedSize) {
        return res.status(400).json({
          message: 'Selecione o tamanho de todos os produtos.'
        })
      }

      const product = await Product.findById(item.productId)

      if (!product) {
        return res.status(404).json({
          message: `Produto não encontrado: ${item.name || item.productId}`
        })
      }

      if (!product.sizes.includes(item.selectedSize)) {
        return res.status(400).json({
          message: `Tamanho inválido para o produto ${product.name}.`
        })
      }

      if (product.stock < Number(item.quantity)) {
        return res.status(400).json({
          message: `Estoque insuficiente para o produto ${product.name}.`
        })
      }

      product.stock -= Number(item.quantity)
      await product.save()

      const subtotal = product.price * Number(item.quantity)

      total += subtotal

      orderItems.push({
        productId: product._id.toString(),
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: Number(item.quantity),
        selectedSize: item.selectedSize
      })
    }

    const order = await Order.create({
      userId: req.user._id,
      customer: {
        name: customer.name.trim(),
        email: customer.email.toLowerCase().trim(),
        address: customer.address.trim(),
        payment: customer.payment
      },
      items: orderItems,
      total,
      status: 'Pagamento aprovado',
      trackingCode: null,
      notes: ''
    })

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao criar pedido.'
    })
  }
})

// Minhas compras - usuário vê apenas os próprios pedidos
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id
    }).sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao buscar suas compras.'
    })
  }
})

// Listar todos os pedidos - ADMIN
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role status')

    res.json(orders)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao buscar pedidos.'
    })
  }
})

// Buscar pedido específico - dono ou admin
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email role status')

    if (!order) {
      return res.status(404).json({
        message: 'Pedido não encontrado.'
      })
    }

    const isOwner =
      order.userId?._id?.toString() === req.user._id.toString() ||
      order.userId?.toString() === req.user._id.toString()

    const isAdmin =
      req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Você não tem permissão para ver este pedido.'
      })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao buscar pedido.'
    })
  }
})

// Atualizar apenas status do pedido - ADMIN
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: 'Status inválido.'
      })
    }

    const updateData = {
      status
    }

    if (status === 'Enviado') {
      const currentOrder = await Order.findById(req.params.id)

      if (currentOrder && !currentOrder.trackingCode) {
        updateData.trackingCode = generateTrackingCode()
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    if (!order) {
      return res.status(404).json({
        message: 'Pedido não encontrado.'
      })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao atualizar status do pedido.'
    })
  }
})

// Atualizar status, rastreio e observação - ADMIN
router.put('/:id/admin-update', protect, adminOnly, async (req, res) => {
  try {
    const { status, trackingCode, notes } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        message: 'Pedido não encontrado.'
      })
    }

    if (status) {
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: 'Status inválido.'
        })
      }

      order.status = status

      if (status === 'Enviado' && !order.trackingCode) {
        order.trackingCode = generateTrackingCode()
      }
    }

    if (trackingCode !== undefined) {
      order.trackingCode = trackingCode.trim() || null
    }

    if (notes !== undefined) {
      order.notes = notes.trim()
    }

    await order.save()

    res.json(order)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao atualizar pedido.'
    })
  }
})

// Cancelar pedido - usuário ou admin
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        message: 'Pedido não encontrado.'
      })
    }

    const isOwner =
      order.userId?.toString() === req.user._id.toString()

    const isAdmin =
      req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Você não tem permissão para cancelar este pedido.'
      })
    }

    if (order.status === 'Entregue') {
      return res.status(400).json({
        message: 'Pedidos entregues não podem ser cancelados.'
      })
    }

    if (order.status === 'Cancelado') {
      return res.status(400).json({
        message: 'Este pedido já foi cancelado.'
      })
    }

    order.status = 'Cancelado'
    await order.save()

    res.json(order)
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao cancelar pedido.'
    })
  }
})

module.exports = router