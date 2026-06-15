const express = require('express')
const router = express.Router()

const Product = require('../models/Product')
const Order = require('../models/Order')
const User = require('../models/User')

const { protect, adminOnly } = require('../middleware/authMiddleware')

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalUsers = await User.countDocuments()

    const orders = await Order.find()

    const validOrders = orders.filter(order =>
      order.status !== 'Cancelado'
    )

    const canceledOrders = orders.filter(order =>
      order.status === 'Cancelado'
    )

    const deliveredOrders = orders.filter(order =>
      order.status === 'Entregue'
    )

    const inProgressOrders = orders.filter(order =>
      order.status !== 'Entregue' &&
      order.status !== 'Cancelado'
    )

    const revenue = validOrders.reduce(
      (acc, order) => acc + Number(order.total || 0),
      0
    )

    const averageTicket =
      validOrders.length > 0
        ? revenue / validOrders.length
        : 0

    const lowStockProducts = await Product.find({
      stock: { $lte: 5 }
    }).sort({ stock: 1 })

    const outOfStockProducts = await Product.find({
      stock: 0
    })

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email role status')

    const topProducts = {}

    validOrders.forEach(order => {
      order.items.forEach(item => {
        if (!topProducts[item.name]) {
          topProducts[item.name] = {
            name: item.name,
            image: item.image,
            quantity: 0,
            revenue: 0
          }
        }

        topProducts[item.name].quantity += Number(item.quantity || 0)
        topProducts[item.name].revenue +=
          Number(item.price || 0) * Number(item.quantity || 0)
      })
    })

    const bestSellingProducts = Object.values(topProducts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,

      revenue,
      averageTicket,

      validOrders: validOrders.length,
      canceledOrders: canceledOrders.length,
      deliveredOrders: deliveredOrders.length,
      inProgressOrders: inProgressOrders.length,

      lowStockProducts,
      outOfStockProducts,
      recentOrders,
      bestSellingProducts
    })
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao carregar dashboard.'
    })
  }
})

module.exports = router